import Event from "./Event";

class OrderFilled implements Event {
    public readonly name: string = "OrderFilled"
    public readonly args: any;

    constructor(orderId: number) {
        this.args = orderId;
    }
}

export default OrderFilled;