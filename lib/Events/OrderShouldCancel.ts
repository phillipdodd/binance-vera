import Event from "./Event";

class OrderShouldCancel implements Event {
    public readonly name: string = "OrderShouldCancel"
    public readonly args: any;

    constructor(orderId: number) {
        this.args = orderId;
    }
}

export default OrderShouldCancel;