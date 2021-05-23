import winston from 'winston';
import { User } from "../constants";
import LogManager from './LogManager';
const Binance = require("us-binance-api-node");

class BinanceMarketplace {
    
    public readonly user: User;
    public readonly client;

    private logger: winston.Logger;

    constructor(user: User) {
        this.user = user;

        this.client = Binance.default({
            apiKey: process.env[`API_KEY_${user}`],
            apiSecret: process.env[`API_SECRET_${user}`],
            getTime: Date.now,
        });

        this.logger = LogManager.getLogger();
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

export default BinanceMarketplace;