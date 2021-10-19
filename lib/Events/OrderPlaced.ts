import { NewOrder } from "us-binance-api-node";
import Event from "./Event";

class OrderPlaced implements Event {
    public readonly name: string = "OrderPlaced"
    public readonly args: any;

    constructor(order: NewOrder) {
        this.args = order;
    }
}

export default OrderPlaced;