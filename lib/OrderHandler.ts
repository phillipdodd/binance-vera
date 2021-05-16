import { ExecutionReport, NewOrder, OrderSide } from "us-binance-api-node";
import { TradePosition } from "../constants";
import Calc from "./Calc";
import Instance from "./Instance";
import LongStrategy from "./OrderStrategy/LongStrategy";
import OrderStrategy from "./OrderStrategy/OrderStrategy";

class OrderHandler {

    private instance: Instance;
    private orderStrategy: OrderStrategy;

    constructor(instance: Instance) {
        this.instance = instance;
        this.orderStrategy = new LongStrategy(instance);
    }
    
    public setStrategy(orderStrategy: OrderStrategy) {
        this.orderStrategy = orderStrategy;
    }

    private async initOrder() {

    }

    private async placeOrder(executionReport: ExecutionReport): Promise<any> {
        const orderOptions: NewOrder = await this.orderStrategy.getOrderOptions(executionReport);
        const orderResponse = await this.instance.client.order(orderOptions);
        return orderResponse;
    }

    private async cancelOrder(symbol: string, orderId: number): Promise<any> {
        await this.instance.client.cancelOrder({ symbol, orderId });
    }

}

export default OrderHandler;