import { ExecutionReport, OrderSide } from "us-binance-api-node";
import { DEFAULTS } from "../../constants";
import BinanceMarketplace from "../BinanceMarketplace";
import Calc from "../Calc";
import OrderStrategy from "./OrderStrategy";

class LongStrategy extends OrderStrategy {

    startSide: OrderSide;

    constructor(marketplace: BinanceMarketplace) {
        super(marketplace);
        this.startSide = "BUY";
    }

    protected async getStartPrice(symbol: string): Promise<string> {
        return await this.marketplace.getHighestBid(symbol);
    }

    protected async getRelistPrice(executionReport: ExecutionReport): Promise<string> {
        const { symbol, priceLastTrade, price } = executionReport;

        const incomingPrice = priceLastTrade || price;
        const increasedPrice = this.addTicks(symbol, incomingPrice);

        const lowestAsk = await this.marketplace.getLowestAsk(symbol);

        return Math.max(+lowestAsk, +increasedPrice).toString();
    }

    private addTicks(symbol: string, price: string) {
        const tickSize = this.marketplace.exchangeInfo.getTickSize(symbol);
        const increaseAmount = Calc.mul(tickSize, DEFAULTS.NUM_TICKS_CHANGED);
        return Calc.add(price, increaseAmount);
    }
}

export default LongStrategy;