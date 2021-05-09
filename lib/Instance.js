require("dotenv").config();
const Binance = require("us-binance-api-node");
const ExchangeInfo = require("./ExchangeInfo.js");
const StateHandlers = require('./StateHandlers.js');
const Calc = require("./Calc.js");
const { STATES, CONFIG } = require("../constants.js");

//todo replace with conf npm thing
const defaultTickChangeNum = 3;

class Instance {
    constructor(user) {
        this.client = Binance.default({
            apiKey: process.env[`API_KEY_${user}`],
            apiSecret: process.env[`API_SECRET_${user}`],
            getTime: Date.now,
        });
        this.state = STATES[CONFIG.defaultState];
        this.stateHandlers = new StateHandlers(this.client);
        this.exchangeInfo = new ExchangeInfo(this.client);
    }

    async init() {
        await this.exchangeInfo.init();
        await this.stateHandlers.init();
    }

    toggleState() {
        if (this.state === STATES.BUY) {
            this.state = STATES.SELL;
        } else {
            this.state = STATES.BUY;
        }
    }

    async handleExecutionReport(executionReport) {
        const flipToSide = executionReport.side === "BUY" ? "SELL" : "BUY";
        const handler = this.stateHandlers.getHandler(flipToSide);
        const { price, quantity } = handler(executionReport);

        const order = await this.placeOrder({
            symbol,
            quantity,
            price,
            type: "LIMIT",
            side: flipToSide,
        });

        this.createTimerForOrder(order.orderId, flipToSide);
    }

    //todo
    createTimerForOrder(orderId, flipToSize) {
        throw new Error('not implemented');
    };

    async placeOrder(options) {
        const correctedOptions = this.correctTickAndStep(options);
        const order = await this.client.order(correctedOptions);
        return order;
    }

    async getOpenOrders(symbol) {
        return await this.client.openOrders({ symbol });
    }

    async getAccountBalances() {
        return await newInstance.client.accountInfo();
    }

    async getFlipToAskPrice({ symbol, price, priceLastTrade } = {}) {
        const incomingPrice = price || priceLastTrade;
        const increasedPrice = this.addTicks(symbol, incomingPrice, defaultTickChangeNum);
        const lowestAsk = await this.getLowestAsk(symbol);
        return Math.max(+lowestAsk, +increasedPrice);
    }

    async getFlipToBidPrice({ symbol, price, priceLastTrade } = {}) {
        const incomingPrice = price || priceLastTrade;
        const decreasedPrice = this.subTicks(symbol, incomingPrice, defaultTickChangeNum);
        const highestBid = await this.getHighestBid(symbol);
        return Math.max(+highestBid, +decreasedPrice);
    }

    addTicks(symbol, price, numTicks = defaultTickChangeNum) {
        const tickSize = this.exchangeInfo.getTickSize(symbol);
        const increaseAmount = Calc.mul(tickSize, numTicks);
        return Calc.add(price, increaseAmount);
    }

    subTicks(symbol, price, numTicks = defaultTickChangeNum) {
        const tickSize = this.exchangeInfo.getTickSize(symbol);
        const decreaseAmount = Calc.mul(tickSize, numTicks);
        return Calc.sub(price, decreaseAmount);
    }

    async getLowestAsk(symbol) {
        const orderBook = await this.getOrderBook(symbol);
        return orderBook.asks[0].price;
    }

    async getHighestBid(symbol) {
        const orderBook = await this.getOrderBook(symbol);
        return orderBook.bids[0].price;
    }

    async getOrderBook(symbol) {
        const orderBook = await this.client.book({ symbol });
        return orderBook;
    }

    getOrderQuantity(price) {
        return Calc.div(CONFIG.BUYIN, price);
    }
}

module.exports = Instance;