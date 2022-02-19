import { ExecutionReport } from "us-binance-api-node";
import Event from "./Event";

type OrderCancelledArgs = {
    executionReport: ExecutionReport
}

//todo this should be named OrderDidCancel
class OrderCancelled implements Event {
    public readonly name: string = "OrderCancelled"
    public readonly args: OrderCancelledArgs;

    constructor(executionReport: ExecutionReport) {
        this.args = { executionReport };
    }
}

export default OrderCancelled;