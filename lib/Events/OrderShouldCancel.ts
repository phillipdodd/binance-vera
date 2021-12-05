import { CancelOrderResult } from "us-binance-api-node";
import Event from "./Event";

type OrderShouldCancelArgs = {
    cancelOrderResult: CancelOrderResult
}

class OrderShouldCancel implements Event {
    public readonly name: string = "OrderShouldCancel"
    public readonly args: OrderShouldCancelArgs;

    constructor(cancelOrderResult: CancelOrderResult) {
        this.args = { cancelOrderResult };
    }
}

export default OrderShouldCancel;