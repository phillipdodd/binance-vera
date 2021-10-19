import { ExecutionReport, OrderSide } from "us-binance-api-node";
import { DEFAULTS } from "../../constants";
import Calc from "../Calc";
import Instance from "../Instance";
import OrderStrategy from "./OrderStrategy";

class LongStrategy extends OrderStrategy {

    startSide: OrderSide;

    constructor(instance: Instance) {
        super(instance);
        this.startSide = "BUY";
    }

    protected async getRelistPrice(executionReport: ExecutionReport): Promise<string> {
        const { symbol, priceLastTrade, price } = executionReport;

        const incomingPrice = priceLastTrade || price;
        const increasedPrice = this.addTicks(symbol, incomingPrice);

        const lowestAsk = await this.instance.getLowestAsk(symbol);

        return Math.max(+lowestAsk, +increasedPrice).toString();
    }

    protected async getStartPrice(symbol: string): Promise<string> {
        return await this.instance.getHighestBid(symbol);
    }

    private addTicks(symbol: string, price: string) {
        const tickSize = this.instance.exchangeInfo.getTickSize(symbol);
        const increaseAmount = Calc.mul(tickSize, DEFAULTS.NUM_TICKS_CHANGED);
        return Calc.add(price, increaseAmount);
    }
}

export default LongStrategy;