import { Order } from "us-binance-api-node";
import Event from "./Event";

type OrderPlacedArgs = {
    order: Order
}

class OrderPlaced implements Event {
    public readonly name: string = "OrderPlaced"
    public readonly args: OrderPlacedArgs;

    constructor(order: Order) {
        this.args = { order };
    }
}

export default OrderPlaced;