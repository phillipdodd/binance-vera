import 'dotenv/config'

import SimplifiedExchangeInfo from "./SimplifiedExchangeInfo";

const Binance = require("us-binance-api-node");
import { ExecutionReport, OutboundAccountInfo } from "us-binance-api-node";
import { User, TradePosition, CONFIG, DEFAULTS } from "../constants"
import OrderHandler from './OrderHandler';

class Instance {
    
    public readonly client;
    public readonly exchangeInfo: SimplifiedExchangeInfo;
    
    public orderHandler: OrderHandler;
    
    private tradePosition: TradePosition;
    private websocketClosers: Map<string, Function>;

    constructor(user: User) {
        this.client = Binance.default({
            apiKey: process.env[`API_KEY_${user}`],
            apiSecret: process.env[`API_SECRET_${user}`],
            getTime: Date.now,
        });

        this.tradePosition = DEFAULTS.TRADE_POSITION;

        this.websocketClosers = new Map();
        this.exchangeInfo = new SimplifiedExchangeInfo(this.client);
        this.orderHandler = new OrderHandler(this);
    }

    async init(): Promise<boolean> {
        await this.startWebsocket();
        await this.exchangeInfo.init();

        console.log("Instance initialized");
        return true;
    }

    toggleTradePosition() {
        if (this.tradePosition === TradePosition.Long) {
            this.tradePosition = TradePosition.Short;
        } else {
            this.tradePosition = TradePosition.Long;
        }
    }

    getTradePosition(): TradePosition {
        return this.tradePosition;
    }

    async startWebsocket(): Promise<void> {
        const userCallback = (eventData: OutboundAccountInfo | ExecutionReport) => {
            // if ((eventData as ExecutionReport).orderStatus === 'FILLED') {
            //     this.relistLimitOrder(eventData as ExecutionReport);
            // }
        };
        const userWebsocketCloser = await this.client.ws.user(userCallback);
        this.websocketClosers.set('user', userWebsocketCloser);
    }

    closeAllWebsockets() {
        this.websocketClosers.forEach(ws => ws());
        this.websocketClosers.clear();
    }

    getWebsocketCloserCount(): number {
        return this.websocketClosers.size;
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
}

export default Instance;