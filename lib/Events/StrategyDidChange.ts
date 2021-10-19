import OrderStrategy from "../OrderStrategy/OrderStrategy";
import Event from "./Event";

class StrategyDidChange implements Event {
    public readonly name: string = "StrategyDidChange"
    public readonly args: any;

    constructor(newStrategy: OrderStrategy) {
        this.args = newStrategy;
    }
}

export default StrategyDidChange;