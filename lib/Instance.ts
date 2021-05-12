require("dotenv").config();

import SimplifiedExchangeInfo from "./SimplifiedExchangeInfo";
import Calc from "./Calc";
const Binance = require("us-binance-api-node");

import { User, TradePosition, CONFIG } from "../constants"
import { ExecutionReport, NewOrder, OrderSide, OutboundAccountInfo } from "us-binance-api-node";
import { PriceController } from "./PriceController";
import LongPriceController from "./LongPriceController"
import ShortPriceController from "./ShortPriceController";
//todo replace with conf npm thing
const defaultTickChangeNum = 3;

export default class Instance {
    
    private client;
    private tradePosition: TradePosition;
    private priceControllers: Map<TradePosition, PriceController>;
    private exchangeInfo: SimplifiedExchangeInfo;
    private activeOrders: Map<number, TradePosition>;
    private websockets: any;

    constructor(user: User) {
        this.client = Binance.default({
            apiKey:    <string>process.env[`API_KEY_${user}`],
            apiSecret: <string>process.env[`API_SECRET_${user}`],
            getTime: Date.now,
        });

        this.tradePosition = CONFIG.DEFAULT_STATE;
        this.exchangeInfo = new SimplifiedExchangeInfo(this.client);

        this.priceControllers = new Map();
        this.priceControllers.set(TradePosition.Long, new LongPriceController(this));
        this.priceControllers.set(TradePosition.Short, new ShortPriceController(this));

        // {orderId: stateName}
        this.activeOrders = new Map();
        this.websockets = {};
    }

    async init() {
        await this.exchangeInfo.init();
        await this.startWebsocket();

        console.log("Instance initialized");
    }

    toggleTradePosition() {
        if (this.tradePosition === TradePosition.Long) {
            this.tradePosition = TradePosition.Short;
        } else {
            this.tradePosition = TradePosition.Long;
        }
    }

    async startWebsocket(): Promise<void> {
        this.websockets.user = this.client.user((eventData: OutboundAccountInfo | ExecutionReport) => {
            if ((eventData as ExecutionReport).orderStatus) {
                this.relistLimitOrder(eventData as ExecutionReport);
            }
        });
    }

    //todo make order type
    async relistLimitOrder(executionReport: ExecutionReport) {
        const { symbol, orderId, side } = executionReport;
        const forPosition = this.getPositionOrderPlacedIn(orderId);
        const relistSide = reverseSide(side);

        const priceController = <PriceController>this.priceControllers.get(forPosition);
        const handler = priceController.getHandler(relistSide);
        const { price, quantity } = await handler(executionReport);

        const relistOrder = await this.placeOrder({
            symbol,
            quantity,
            price,
            side: <OrderSide>relistSide,
            type: "LIMIT",
        });

        this.activeOrders.set(relistOrder.orderId, this.tradePosition);
        this.activeOrders.delete(executionReport.orderId);

        await this.createTimerForOrder(symbol, relistOrder.orderId);

        return relistOrder;
    }

    createTimerForOrder(symbol: string, orderId: number) {
        setTimeout(async () => {
            const forState = this.activeOrders.get(orderId);
            if (forState) {
                await this.client.cancelOrder({ symbol, orderId });
                await this.placeInitOrder(symbol, forState);
            }
        }, CONFIG.RELIST_TIME);
    }

    getPositionOrderPlacedIn(orderId: number) {
        const state = this.activeOrders.get(orderId);
        return state || this.tradePosition;
    }

    async placeInitOrder(symbol: string, forPosition: TradePosition) {
        const initSide = getInitOrderSide(forPosition);
        const priceController = <PriceController>this.priceControllers.get(forPosition);
        const handler = priceController.getHandler(initSide);
        const { price, quantity } = await handler({ symbol });
        const initOrder = await this.placeOrder({
            symbol,
            quantity,
            price,
            side: <OrderSide>initSide,
            type: "LIMIT",
        });

        this.activeOrders.set(initOrder.orderId, forPosition);
        await this.createTimerForOrder(symbol, initOrder.orderId);

        return initOrder;
    }

    async placeOrder(options: NewOrder) {
        const correctedOptions: NewOrder = this.correctTickAndStep(options);
        const order = await this.client.order(correctedOptions);
        return order;
    }

    async cancelOrder(symbol: string, orderId: number) {
        await this.client.cancelOrder({ symbol, orderId });
        this.activeOrders.delete(orderId);
    }

    async getOpenOrders(symbol: string) {
        return await this.client.openOrders({ symbol });
    }

    async getAccountBalances() {
        return await this.client.accountInfo();
    }

    async getRelistAskPrice(symbol: string, price: string, priceLastTrade?: string) : Promise<string> {
        const incomingPrice = priceLastTrade || price;
        const increasedPrice = this.addTicks(symbol, incomingPrice, defaultTickChangeNum);
        const lowestAsk = await this.getLowestAsk(symbol);
        return Math.max(+lowestAsk, +increasedPrice).toString();
    }

    async getRelistBidPrice(symbol: string, price: string, priceLastTrade?: string) : Promise<string> {
        const incomingPrice = priceLastTrade || price;
        const decreasedPrice = this.subTicks(symbol, incomingPrice, defaultTickChangeNum);
        const highestBid = await this.getHighestBid(symbol);
        return Math.min(+highestBid, +decreasedPrice).toString();
    }

    addTicks(symbol: string, price: string, numTicks = defaultTickChangeNum) {
        const tickSize = this.exchangeInfo.getTickSize(symbol);
        const increaseAmount = Calc.mul(tickSize, numTicks);
        return Calc.add(price, increaseAmount);
    }

    subTicks(symbol: string, price: string, numTicks = defaultTickChangeNum) {
        const tickSize = this.exchangeInfo.getTickSize(symbol);
        const decreaseAmount = Calc.mul(tickSize, numTicks);
        return Calc.sub(price, decreaseAmount);
    }

    async getLowestAsk(symbol: string) {
        const orderBook = await this.getOrderBook(symbol);
        return orderBook.asks[0].price;
    }

    async getHighestBid(symbol: string) {
        const orderBook = await this.getOrderBook(symbol);
        return orderBook.bids[0].price;
    }

    async getOrderBook(symbol: string) {
        const orderBook = await this.client.book({ symbol });
        return orderBook;
    }

    getOrderQuantity(price: string): string {
        return Calc.div(CONFIG.BUYIN, price).toString();
    }

    correctTickAndStep(options: NewOrder) {
    //* Market orders will not be including a 'price' property
    if (options.hasOwnProperty("price")) {
        options.price = Calc.roundToTickSize(options.price, this.exchangeInfo.getTickSize(options.symbol));
    }

    if (options.hasOwnProperty("quantity")) {
        options.quantity = Calc.roundToStepSize(options.quantity, this.exchangeInfo.getStepSize(options.symbol));
    }

    return options;
}
}

function reverseSide(orderSide: OrderSide) {
    if (orderSide != "BUY" && orderSide != "SELL") {
        throw new Error(`${orderSide} is not a valid order side`);
    }
    if (orderSide === "BUY") {
        return "SELL";
    } else {
        return "BUY"
    }
}

function getInitOrderSide(position: TradePosition): OrderSide {
    if (position === TradePosition.Short) {
        return "SELL";
    } else {
        return "BUY";
    }
}