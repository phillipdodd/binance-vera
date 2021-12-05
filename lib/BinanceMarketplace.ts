import { Binance, CancelOrderResult, ExecutionReport, NewOrder, OutboundAccountInfo } from "us-binance-api-node";
import { User } from "../constants";
import AppInitialized from "./Events/AppInitialized";
import OrderFilled from "./Events/OrderFilled";
import EventManager from "./EventSystem/EventManager";
import LongStrategy from "./OrderStrategy/LongStrategy";
import OrderStrategy from "./OrderStrategy/OrderStrategy";
import SimplifiedExchangeInfo from "./SimplifiedExchangeInfo";
const binance = require("us-binance-api-node");

class BinanceMarketplace {
    
    public readonly user: User;
    public readonly client: Binance;
    
    public events: EventManager;
    public exchangeInfo: SimplifiedExchangeInfo;

    private websocketClosers: Map<string, Function> = new Map();
    private orderStrategy: OrderStrategy;

    constructor(user: User, events: EventManager) {
        this.user = user;
        this.events = events;
        this.exchangeInfo = new SimplifiedExchangeInfo(this);

        this.client = binance.default({
            apiKey: process.env[`API_KEY_${user}`],
            apiSecret: process.env[`API_SECRET_${user}`],
            getTime: Date.now,
        });

        this.orderStrategy = new LongStrategy(this);

    }
    
    async init() {
        await this.exchangeInfo.init();
        this.events.notify(new AppInitialized());
    }

    async getOpenOrders(symbol: string) {
        return await this.client.openOrders({ symbol });
    }

    async getAccountBalances() {
        return await this.client.accountInfo();
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

    public async placeOrder(orderOptions: NewOrder) {
        const orderResponse = await this.client.order(orderOptions);
        return orderResponse;
    }

    public async cancelOrder(symbol: string, orderId: string | number): Promise<CancelOrderResult> {
        const cancelOrderResult = await this.client.cancelOrder({ symbol, orderId: <number>orderId });
        return cancelOrderResult;
    }

    public async initOrder(symbol: string) {
        const orderOptions: NewOrder = await this.orderStrategy.getInitialOrderOptions(symbol);
        await this.placeOrder(orderOptions);
    }

    public async relistOrder(executionReport: ExecutionReport) {
        const orderOptions: NewOrder = await this.orderStrategy.getRelistOrderOptions(executionReport);
        await this.placeOrder(orderOptions);
    }

    public setStrategy(orderStrategy: OrderStrategy) {
        this.orderStrategy = orderStrategy;
    }

    async startUserWebsocket(): Promise<void> {
        const isExecutionReport = (eventData: OutboundAccountInfo | ExecutionReport) : eventData is ExecutionReport => {
            return (eventData as any).orderStatus !== undefined;
        }

        const userCallback = (eventData: OutboundAccountInfo | ExecutionReport) => {
            if (isExecutionReport(eventData)) {
                if (eventData.orderStatus === 'FILLED') {
                    const orderFilledEvent = new OrderFilled(eventData);
                    this.events.notify(orderFilledEvent);
                }
            }
        }

        const userWebsocketCloser = await this.client.ws.user(userCallback);
        this.websocketClosers.set('user', userWebsocketCloser);
    }

    closeAllWebsockets() {
        this.websocketClosers.forEach(ws => ws());
        this.websocketClosers.clear();
    }

    getOpenWebsocketCount(): number {
        return this.websocketClosers.size;
    }
}

export default BinanceMarketplace;