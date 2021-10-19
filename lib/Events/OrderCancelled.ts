import Event from "./Event";

class OrderCancelled implements Event {
    public readonly name: string = "OrderCancelled"
    public readonly args: any;

    constructor(orderId: string | number) {
        this.args = orderId;
    }
}

export default OrderCancelled;