import { ExecutionReport, OrderSide } from "us-binance-api-node";
import { DEFAULTS } from "../../constants";
import Calc from "../Calc";
import Instance from "../Instance";
import OrderStrategy from "./OrderStrategy";

class ShortStrategy extends OrderStrategy {

    startSide: OrderSide;

    constructor(instance: Instance) {
        super(instance);
        this.startSide = "SELL";
    }

    protected async getRelistPrice(executionReport: ExecutionReport): Promise<string> {
        const { symbol, priceLastTrade, price } = executionReport;

        const incomingPrice = priceLastTrade || price;
        const decreasedPrice = this.subTicks(symbol, incomingPrice);

        const highestBid = await this.instance.getHighestBid(symbol);

        return Math.min(+highestBid, +decreasedPrice).toString();
    }

    protected async getStartPrice(executionReport: ExecutionReport): Promise<string> {
        return await this.instance.getLowestAsk(executionReport.symbol);
    }

    private subTicks(symbol: string, price: string) {
        const tickSize = this.instance.exchangeInfo.getTickSize(symbol);
        const decreaseAmount = Calc.mul(tickSize, DEFAULTS.NUM_TICKS_CHANGED);
        return Calc.sub(price, decreaseAmount);
    }
}

export default ShortStrategy;