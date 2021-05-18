import { ExecutionReport, NewOrder } from "us-binance-api-node";
import { USER_CONFIG } from "../constants";
import EventListener from "./EventSystem/EventListener";
import EventType from "./EventSystem/EventType";
import Instance from "./Instance";
import LongStrategy from "./OrderStrategy/LongStrategy";
import OrderStrategy from "./OrderStrategy/OrderStrategy";
import ShortStrategy from "./OrderStrategy/ShortStrategy";

class OrderHandler implements EventListener {

    private instance: Instance;
    private orderStrategy: OrderStrategy;

    constructor(instance: Instance) {
        this.instance = instance;

        this.instance.events.subscribe("AppInitialized", this);
        this.instance.events.subscribe("OrderFilled", this);
        this.instance.events.subscribe("OrderShouldCancel", this);
        this.instance.events.subscribe("StrategyShouldChange", this);
        
        this.orderStrategy = new LongStrategy(instance);
        // this.orderStrategy = new ShortStrategy(instance);
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
                this.handleAppInitialized()
                break;
            
            case "OrderFilled":
                this.handleOrderFilled(data);
                break;
            
            case "OrderShouldCancel":
                this.handleOrderShouldCancel(data);
                break;
            
            case "StrategyShouldChange":
                this.handleStrategyShouldChange();
                break;
        
            default:
                break;
        }
    }

    private async handleAppInitialized() {
        const initSymbols = USER_CONFIG[this.instance.user].INIT_SYMBOLS;
        for (const symbol of initSymbols) {
            try {
                await this.initOrder(symbol);
            } catch (error) {
                this.instance.logger.error(`initOrder - ${symbol} - ${error.message}`);
            }
        }
    }

    private async handleOrderFilled(executionReport: ExecutionReport) {
        try {
            await this.relistOrder(executionReport);
        } catch (error) {
            this.instance.logger.error(`handleOrderFilled - ${executionReport.symbol} ${executionReport.orderId} - ${error.message}`);
        }
    }

    private async handleOrderShouldCancel(data: {symbol: string, orderId: string | number}) {
        await this.cancelOrder(data.symbol, data.orderId);
    }

    private async handleStrategyShouldChange() {
        if (this.orderStrategy instanceof LongStrategy) {
            this.setStrategy(new ShortStrategy(this.instance));
        } else {
            this.setStrategy(new LongStrategy(this.instance));
        }
        this.instance.events.notify("StrategyDidChange", this.orderStrategy);
    }

    private async initOrder(symbol: string) {
        const orderOptions: NewOrder = await this.orderStrategy.getInitialOrderOptions(symbol);
        await this.placeOrder(orderOptions);
    }

    private async relistOrder(executionReport: ExecutionReport) {
        const orderOptions: NewOrder = await this.orderStrategy.getRelistOrderOptions(executionReport);
        await this.placeOrder(orderOptions);
    }

    private async placeOrder(orderOptions: NewOrder) {
        try {
            const orderResponse = await this.instance.client.order(orderOptions);
            this.instance.events.notify("OrderPlaced", orderResponse);
            return orderResponse;
        } catch (error) {
            this.instance.logger.error(`placeOrder - ${JSON.stringify(orderOptions)}`);
            throw error;
        }
    }

    private async cancelOrder(symbol: string, orderId: string | number): Promise<any> {
        const cancelledOrder = await this.instance.client.cancelOrder({ symbol, orderId: <number>orderId });
        this.instance.events.notify("OrderCancelled", cancelledOrder);
    }

}

export default OrderHandler;