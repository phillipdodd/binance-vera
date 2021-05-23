import { ExecutionReport, OrderSide } from "us-binance-api-node";
import { DEFAULTS } from "../../constants";
import BinanceMarketplace from "../BinanceMarketplace";
import Calc from "../Calc";
import SimplifiedExchangeInfo from "../SimplifiedExchangeInfo";
import OrderStrategy from "./OrderStrategy";

class LongStrategy extends OrderStrategy {

    startSide: OrderSide;

    constructor(binance: BinanceMarketplace, exchangeInfo: SimplifiedExchangeInfo) {
        super(binance, exchangeInfo);
        this.startSide = "BUY";
    }

    protected async getRelistPrice(executionReport: ExecutionReport): Promise<string> {
        const { symbol, priceLastTrade, price } = executionReport;

        const incomingPrice = priceLastTrade || price;
        const increasedPrice = this.addTicks(symbol, incomingPrice);

        const lowestAsk = await this.binance.getLowestAsk(symbol);

        return Math.max(+lowestAsk, +increasedPrice).toString();
    }

    protected async getStartPrice(symbol: string): Promise<string> {
        return await this.binance.getHighestBid(symbol);
    }

    private addTicks(symbol: string, price: string) {
        const tickSize = this.exchangeInfo.getTickSize(symbol);
        const increaseAmount = Calc.mul(tickSize, DEFAULTS.NUM_TICKS_CHANGED);
        return Calc.add(price, increaseAmount);
    }
}

export default LongStrategy;