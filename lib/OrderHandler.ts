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

class OrderHandler implements EventListener {

    private binance: BinanceMarketplace;
    private exchangeInfo: SimplifiedExchangeInfo;
    private events: EventManager = EventManager.getEventManager();
    private logger: winston.Logger;
    private orderStrategy: OrderStrategy;

    constructor(binance: BinanceMarketplace, exchangeInfo: SimplifiedExchangeInfo) {
        this.binance = binance;
        this.exchangeInfo = exchangeInfo;

        this.events.subscribe("AppInitialized", this);
        this.events.subscribe("OrderFilled", this);
        this.events.subscribe("OrderShouldCancel", this);
        this.events.subscribe("StrategyShouldChange", this);
        
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

    public update(eventType: EventType, data: any): void {
        switch (eventType) {
            case "AppInitialized":
                this.onAppInitialized()
                break;
            
            case "OrderFilled":
                this.onOrderFilled(data);
                break;
            
            case "OrderShouldCancel":
                this.onOrderShouldCancel(data);
                break;
            
            case "StrategyShouldChange":
                this.onStrategyShouldChange();
                break;
        
            default:
                break;
        }
    }

    private async onAppInitialized() {
        const initSymbols = USER_CONFIG[this.binance.user].INIT_SYMBOLS;
        for (const symbol of initSymbols) {
            try {
                await this.initOrder(symbol);
            } catch (error) {
                this.logger.error(`initOrder - ${symbol} - ${error.message}`);
            }
        }
    }

    private async onOrderFilled(executionReport: ExecutionReport) {
        try {
            await this.relistOrder(executionReport);
        } catch (error) {
            this.logger.error(`handleOrderFilled - ${executionReport.symbol} ${executionReport.orderId} - ${error.message}`);
        }
    }

    private async onOrderShouldCancel(data: {symbol: string, orderId: string | number}) {
        await this.cancelOrder(data.symbol, data.orderId);
    }

    private async onStrategyShouldChange() {
        if (this.orderStrategy instanceof LongStrategy) {
            this.setStrategy(new ShortStrategy(this.binance, this.exchangeInfo));
        } else {
            this.setStrategy(new LongStrategy(this.binance, this.exchangeInfo));
        }
        this.events.notify("StrategyDidChange", this.orderStrategy);
    }

    private async initOrder(symbol: string) {
        const orderOptions: NewOrder = await this.orderStrategy.getInitialOrderOptions(symbol);
        await this.placeOrder(orderOptions);
    }

    private async relistOrder(executionReport: ExecutionReport) {
        const orderOptions: NewOrder = await this.orderStrategy.getRelistOrderOptions(executionReport);
        await this.placeOrder(orderOptions);
    }

    //todo this shouldn't have to access the client prop
    private async placeOrder(orderOptions: NewOrder) {
        try {
            const orderResponse = await this.binance.client.order(orderOptions);
            this.events.notify("OrderPlaced", orderResponse);
            return orderResponse;
        } catch (error) {
            this.logger.error(`placeOrder - ${JSON.stringify(orderOptions)}`);
            throw error;
        }
    }
    
    //todo this shouldn't have to access the client prop
    private async cancelOrder(symbol: string, orderId: string | number): Promise<any> {
        await this.binance.client.cancelOrder({ symbol, orderId: <number>orderId });
        this.events.notify("OrderCancelled", orderId);
    }

}

export default OrderHandler;