import { CancelOrderResult } from "us-binance-api-node";
import Event from "./Event";

type OrderCancelledArgs = {
    cancelOrderResult: CancelOrderResult
}


//todo this should be named OrderDidCancel
class OrderCancelled implements Event {
    public readonly name: string = "OrderCancelled"
    public readonly args: OrderCancelledArgs;

    constructor(cancelOrderResult: CancelOrderResult) {
        this.args = { cancelOrderResult };
    }
}

export default OrderCancelled;