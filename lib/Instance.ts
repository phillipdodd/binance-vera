import 'dotenv/config'
import winston from 'winston';


const Binance = require("us-binance-api-node");
import { User, DEFAULTS } from "../constants"
import AppInitialized from './Events/AppInitialized';
import EventManager from './EventSystem/EventManager';
import LogManager from './LogManager';
import OrderHandler from './OrderHandler';
import SimplifiedExchangeInfo from "./SimplifiedExchangeInfo";
import WebsocketManager from './WebsocketManager';

class Instance {
    
    public readonly user: User;
    public readonly client;
    public readonly events;
    public readonly exchangeInfo: SimplifiedExchangeInfo;

    private logManager: LogManager;
    public readonly logger: winston.Logger;

    public orderHandler: OrderHandler;

    private websocketManager: WebsocketManager;


    constructor(user: User) {
        this.user = user;

        this.client = Binance.default({
            apiKey: process.env[`API_KEY_${user}`],
            apiSecret: process.env[`API_SECRET_${user}`],
            getTime: Date.now,
        });

        this.events = new EventManager(this);
        this.logManager = new LogManager(this);
        this.logger = this.logManager.logger;
        this.exchangeInfo = new SimplifiedExchangeInfo(this);
        this.orderHandler = new OrderHandler(this);
        this.websocketManager = new WebsocketManager(this);
    }

    async init(): Promise<boolean> {
        await this.exchangeInfo.init();
        await this.websocketManager.startUserWebsocket();

        this.events.notify(new AppInitialized());
        return true;
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