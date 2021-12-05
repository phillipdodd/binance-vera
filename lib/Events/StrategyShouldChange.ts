import OrderStrategy from "../OrderStrategy/OrderStrategy";
import Event from "./Event";

type StrategyShouldChangeArgs = {
    targetStrategy: OrderStrategy
}

class StrategyShouldChange implements Event {
    public readonly name: string = "StrategyShouldChange";
    public readonly args: StrategyShouldChangeArgs;

    constructor(targetStrategy: OrderStrategy) {
        this.args = { targetStrategy };
    }
}

export default StrategyShouldChange;