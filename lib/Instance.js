require("dotenv").config();
// @ts-ignore
const Binance = require("us-binance-api-node");
const ExchangeInfo = require("./ExchangeInfo.js");
const StateHandlers = require('./StateHandlers.js');
const Calc = require("./Calc.js");
const { STATES, CONFIG } = require("../constants.js");

//todo replace with conf npm thing
const defaultTickChangeNum = 3;

class Instance {
    /**
     *
     * @param {string} user
     */
    constructor(user) {
        this.client = Binance.default({
            apiKey: process.env[`API_KEY_${user}`],
            apiSecret: process.env[`API_SECRET_${user}`],
            getTime: Date.now,
        });
        this.state = STATES[CONFIG.defaultState];
        this.stateHandlers = new StateHandlers(this.client);
        this.exchangeInfo = new ExchangeInfo(this.client);

        // {orderId: stateName}
        this.activeOrders = new Map();
        this.websockets = {};
    }

    async init() {
        await this.exchangeInfo.init();
        await this.stateHandlers.init();
        await this.startWebsocket();

        console.log("Instance initialized");
    }

    toggleState() {
        if (this.state === STATES.LONG) {
            this.state = STATES.SHORT;
        } else {
            this.state = STATES.LONG;
        }
    }

    async startWebsocket() {
        this.websockets.user = this.client.user((eventData) => {
            if (eventData.orderStatus === "FILLED") {
                this.relistLimitOrder(eventData);
            }
        });
    }

    /**
     *
     * @param {Object} executionReport
     * @returns {Promise<Object>}
     */
    async relistLimitOrder(executionReport) {
        const { symbol, orderId, side } = executionReport;
        const forState = this.getStateOrderPlacedIn(orderId);
        const relistSide = reverseSide(side);

        const handler = this.stateHandlers.getHandler(forState, relistSide);
        const { price, quantity } = handler(executionReport);

        const relistOrder = await this.placeOrder({
            symbol,
            quantity,
            price,
            type: "LIMIT",
            side: relistSide,
        });

        this.activeOrders.set(relistOrder.orderId, this.state);
        this.activeOrders.delete(executionReport.orderId);

        await this.createTimerForOrder(symbol, relistOrder.orderId);

        return relistOrder;
    }

    /**
     *
     * @param {string} symbol
     * @param {string} orderId
     */
    createTimerForOrder(symbol, orderId) {
        setTimeout(async () => {
            const forState = this.activeOrders.get(orderId);
            if (forState) {
                await this.client.cancelOrder({ symbol, orderId });
                await this.placeInitOrder(symbol, forState);
            }
        }, CONFIG.RELIST_TIME);
    }

    /**
     *
     * @param {string} orderId
     * @returns {string} LONG | SHORT
     */
    getStateOrderPlacedIn(orderId) {
        const state = this.activeOrders.get(orderId);
        return state || this.state;
    }

    /**
     *
     * @param {string} symbol
     * @param {string} forState
     * @returns {Promise<Object>}
     */
    async placeInitOrder(symbol, forState) {
        const initSide = getInitOrderSide(forState);
        const handler = this.stateHandlers.getHandler(forState, initSide);
        const { price, quantity } = handler({ symbol });
        const initOrder = await this.placeOrder({
            symbol,
            quantity,
            price,
            side: initSide,
            type: "LIMIT",
        });

        this.activeOrders.set(initOrder.orderId, forState);
        await this.createTimerForOrder(symbol, initOrder.orderId);

        return initOrder;
    }

    /**
     *
     * @param {Object} options
     * @returns {Promise<Object>}
     */
    async placeOrder(options) {
        const correctedOptions = correctTickAndStep(options);
        const order = await this.client.order(correctedOptions);
        return order;
    }

    /**
     *
     * @param {string} symbol
     * @param {string} orderId
     */
    async cancelOrder(symbol, orderId) {
        await this.client.cancelOrder({ symbol, orderId });
        this.activeOrders.delete(orderId);
    }

    /**
     *
     * @param {string} symbol
     * @returns {Promise<Object[]>}
     */
    async getOpenOrders(symbol) {
        return await this.client.openOrders({ symbol });
    }

    /**
     *
     * @returns {Promise<Object[]>}
     */
    async getAccountBalances() {
        return await this.client.accountInfo();
    }

    /**
     *
     * @param {string} symbol
     * @param {string} price
     * @param {string} priceLastTrade - only found in Market orders
     * @returns
     */
    async getRelistAskPrice(symbol, price, priceLastTrade) {
        const incomingPrice = price || priceLastTrade;
        const increasedPrice = this.addTicks(symbol, incomingPrice, defaultTickChangeNum);
        const lowestAsk = await this.getLowestAsk(symbol);
        return Math.max(+lowestAsk, +increasedPrice);
    }

    /**
     *
     * @param {string} symbol
     * @param {string} price
     * @param {string} priceLastTrade - only found in Market orders
     * @returns {Promise<number>}
     */
    async getRelistBidPrice(symbol, price, priceLastTrade) {
        const incomingPrice = price || priceLastTrade;
        const decreasedPrice = this.subTicks(symbol, incomingPrice, defaultTickChangeNum);
        const highestBid = await this.getHighestBid(symbol);
        return Math.min(+highestBid, +decreasedPrice);
    }

    /**
     *
     * @param {string} symbol
     * @param {string} price
     * @param {number} [numTicks=defaultTickChangeNum]
     * @returns {number}
     */
    addTicks(symbol, price, numTicks = defaultTickChangeNum) {
        const tickSize = this.exchangeInfo.getTickSize(symbol);
        const increaseAmount = Calc.mul(tickSize, numTicks);
        return Calc.add(price, increaseAmount);
    }

    /**
     *
     * @param {string} symbol
     * @param {string} price
     * @param {number} [numTicks=defaultTickChangeNum]
     * @returns {number}
     */
    subTicks(symbol, price, numTicks = defaultTickChangeNum) {
        const tickSize = this.exchangeInfo.getTickSize(symbol);
        const decreaseAmount = Calc.mul(tickSize, numTicks);
        return Calc.sub(price, decreaseAmount);
    }

    /**
     *
     * @param {string} symbol
     * @returns {Promise<number>}
     */
    async getLowestAsk(symbol) {
        const orderBook = await this.getOrderBook(symbol);
        return orderBook.asks[0].price;
    }

    /**
     *
     * @param {string} symbol
     * @returns {Promise<number>}
     */
    async getHighestBid(symbol) {
        const orderBook = await this.getOrderBook(symbol);
        return orderBook.bids[0].price;
    }

    /**
     *
     * @param {string} symbol
     * @returns {Promise<Object>}
     */
    async getOrderBook(symbol) {
        const orderBook = await this.client.book({ symbol });
        return orderBook;
    }

    /**
     *
     * @param {number} price
     * @returns {number}
     */
    getOrderQuantity(price) {
        return Calc.div(CONFIG.BUYIN, price);
    }
}

/**
 * 
 * @param {string} side 
 * @returns {string} SELL | BUY
 */
function reverseSide(side) {
    if (side != "BUY" && side != "SELL") {
        throw new Error(`${side} is not a valid order side`);
    }
    if (side === "BUY") return "SELL";
    if (side === "SELL") return "BUY";
}

/**
 * 
 * @param {string} state - LONG | SHORT
 * @returns {string} BUY | SELL
 */
function getInitOrderSide(state) {
    if (state === STATES.LONG) return "BUY";
    if (state === STATES.SHORT) return "SELL";
}

/**
 * 
 * @param {Object} options 
 * @returns {Object}
 */
function correctTickAndStep(options) {
    //* Market orders will not be including a 'price' property
    if (options.hasOwnProperty("price")) {
        options.price = Calc.roundToTickSize(options.price, this.exchangeInfo[options.symbol].tickSize);
    }

    if (options.hasOwnProperty("quantity")) {
        options.quantity = Calc.roundToStepSize(options.quantity, this.exchangeInfo[options.symbol].stepSize);
    }

    return options;
}

module.exports = Instance;