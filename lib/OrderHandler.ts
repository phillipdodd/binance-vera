import { ExecutionReport, NewOrder } from "us-binance-api-node";
import { USER_CONFIG } from "../constants";
import AppInitialized from "./Events/AppInitialized";
import Event from "./Events/Event";
import OrderCancelled from "./Events/OrderCancelled";
import OrderFilled from "./Events/OrderFilled";
import OrderPlaced from "./Events/OrderPlaced";
import OrderShouldCancel from "./Events/OrderShouldCancel";
import StrategyDidChange from "./Events/StrategyDidChange";
import StrategyShouldChange from "./Events/StrategyShouldChange";
import EventListener from "./EventSystem/EventListener";
import Instance from "./Instance";
import LongStrategy from "./OrderStrategy/LongStrategy";
import OrderStrategy from "./OrderStrategy/OrderStrategy";
import ShortStrategy from "./OrderStrategy/ShortStrategy";

class OrderHandler implements EventListener {

    private instance: Instance;
    private orderStrategy: OrderStrategy;

    constructor(instance: Instance) {
        this.instance = instance;

        this.orderStrategy = new LongStrategy(instance);
        
        this.instance.events.subscribe(new AppInitialized(), this);
        this.instance.events.subscribe(new OrderFilled(0), this);
        this.instance.events.subscribe(new OrderShouldCancel(0), this);
        this.instance.events.subscribe(new StrategyShouldChange(this.orderStrategy), this);
        
        
        // this.orderStrategy = new ShortStrategy(instance);
    }

    public getStrategy(): OrderStrategy {
        return this.orderStrategy;
    }
    
    public setStrategy(orderStrategy: OrderStrategy) {
        this.orderStrategy = orderStrategy;
    }

    public update(event: Event): void {
        switch (event.name) {
            case "AppInitialized":
                this.onAppInitialized()
                break;
            
            case "OrderFilled":
                this.onOrderFilled(event.args);
                break;
            
            case "OrderShouldCancel":
                this.onOrderShouldCancel(event.args);
                break;
            
            case "StrategyShouldChange":
                this.onStrategyShouldChange((event.args) as OrderStrategy);
                break;
        
            default:
                break;
        }
    }

    private async onAppInitialized() {
        const initSymbols = USER_CONFIG[this.instance.user].INIT_SYMBOLS;
        for (const symbol of initSymbols) {
            try {
                await this.initOrder(symbol);
            } catch (error) {
                this.instance.logger.error(`initOrder - ${symbol} - ${error.message}`);
            }
        }
    }

    private async onOrderFilled(executionReport: ExecutionReport) {
        try {
            await this.relistOrder(executionReport);
        } catch (error) {
            this.instance.logger.error(`handleOrderFilled - ${executionReport.symbol} ${executionReport.orderId} - ${error.message}`);
        }
    }

    private async onOrderShouldCancel(data: {symbol: string, orderId: string | number}) {
        await this.cancelOrder(data.symbol, data.orderId);
    }

    private async onStrategyShouldChange(strategy: OrderStrategy) {
        this.setStrategy(strategy);
        this.instance.events.notify(new StrategyDidChange(this.orderStrategy));
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
            this.instance.events.notify(new OrderPlaced(orderResponse));
            return orderResponse;
        } catch (error) {
            this.instance.logger.error(`placeOrder - ${JSON.stringify(orderOptions)}`);
            throw error;
        }
    }

    private async cancelOrder(symbol: string, orderId: string | number): Promise<any> {
        await this.instance.client.cancelOrder({ symbol, orderId: <number>orderId });
        this.instance.events.notify(new OrderCancelled(orderId));
    }

}

export default OrderHandler;