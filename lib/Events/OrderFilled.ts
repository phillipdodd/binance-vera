import { ExecutionReport } from "us-binance-api-node";
import Event from "./Event";

type OrderFilledArgs = {
    executionReport: ExecutionReport
}

class OrderFilled implements Event {
    public readonly name: string = "OrderFilled"
    public readonly args: OrderFilledArgs;

    constructor(executionReport: ExecutionReport) {
        this.args = { executionReport };
    }
}

export default OrderFilled;