import { ExecutionReport, NewOrder } from "us-binance-api-node";
import winston from "winston";
import { USER_CONFIG } from "../constants";
import BinanceMarketplace from "./BinanceMarketplace";
import EventListener from "./EventSystem/EventListener";
import EventManager from "./EventSystem/EventManager";
import EventType from "./EventSystem/EventType";
import LogManager from "./LogManager";
import LongStrategy from "./OrderStrategy/LongStrategy";
import OrderStrategy from "./OrderStrategy/OrderStrategy";
import ShortStrategy from "./OrderStrategy/ShortStrategy";
import SimplifiedExchangeInfo from "./SimplifiedExchangeInfo";

class OrderHandler {
    private binance: BinanceMarketplace;
    private exchangeInfo: SimplifiedExchangeInfo;
    private logger: winston.Logger;
    private orderStrategy: OrderStrategy;

    constructor(binance: BinanceMarketplace, exchangeInfo: SimplifiedExchangeInfo) {
        this.binance = binance;
        this.exchangeInfo = exchangeInfo;
        
        this.logger = LogManager.getLogger();

        this.orderStrategy = new LongStrategy(binance, exchangeInfo);
        // this.orderStrategy = new ShortStrategy(binance, exchangeInfo);
    }

    public getStrategy(): OrderStrategy {
        return this.orderStrategy;
    }
    
    public setStrategy(orderStrategy: OrderStrategy) {
        this.orderStrategy = orderStrategy;
    }
    
    public async placeInitialOrders() {
        const initSymbols = USER_CONFIG[this.binance.user].INIT_SYMBOLS;
        for (const symbol of initSymbols) {
            try {
                await this.initOrder(symbol);
            } catch (error) {
                this.logger.error(`initOrder - ${symbol} - ${error.message}`);
            }
        }
    }

    private async initOrder(symbol: string) {
        const orderOptions: NewOrder = await this.orderStrategy.getInitialOrderOptions(symbol);
        await this.placeOrder(orderOptions);
    }

    public async relistOrder(executionReport: ExecutionReport) {
        const orderOptions: NewOrder = await this.orderStrategy.getRelistOrderOptions(executionReport);
        const orderResponse = await this.placeOrder(orderOptions);
        return orderResponse;
    }

    //todo this shouldn't have to access the client prop
    private async placeOrder(orderOptions: NewOrder) {
        try {
            const orderResponse = await this.binance.client.order(orderOptions);
            return orderResponse;
        } catch (error) {
            this.logger.error(`placeOrder - ${JSON.stringify(orderOptions)}`);
            throw error;
        }
    }
    
    //todo this shouldn't have to access the client prop
    public async cancelOrder(symbol: string, orderId: string | number): Promise<any> {
        await this.binance.client.cancelOrder({ symbol, orderId: <number>orderId });
    }

}

export default OrderHandler;