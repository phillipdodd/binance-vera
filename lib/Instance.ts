import 'dotenv/config'


const Binance = require("us-binance-api-node");
import { User, TradePosition, DEFAULTS } from "../constants"
import OrderHandler from './OrderHandler';
import SimplifiedExchangeInfo from "./SimplifiedExchangeInfo";
import WebsocketManager from './WebsocketManager';

class Instance {
    
    public readonly client;
    public readonly exchangeInfo: SimplifiedExchangeInfo;
    
    public orderHandler: OrderHandler;

    private tradePosition: TradePosition;
    private websocketManager: WebsocketManager;

    constructor(user: User) {
        this.client = Binance.default({
            apiKey: process.env[`API_KEY_${user}`],
            apiSecret: process.env[`API_SECRET_${user}`],
            getTime: Date.now,
        });

        this.tradePosition = DEFAULTS.TRADE_POSITION;

        this.exchangeInfo = new SimplifiedExchangeInfo(this);
        this.orderHandler = new OrderHandler(this);
        this.websocketManager = new WebsocketManager(this);
    }

    async init(): Promise<boolean> {
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