import { ExecutionReport, OrderSide } from "us-binance-api-node";
import { DEFAULTS } from "../../constants";
import BinanceMarketplace from "../BinanceMarketplace";
import Calc from "../Calc";
import Instance from "../maybe not used/Instance";
import OrderStrategy from "./OrderStrategy";

class ShortStrategy extends OrderStrategy {

    startSide: OrderSide;

    constructor(marketplace: BinanceMarketplace) {
        super(marketplace);
        this.startSide = "SELL";
    }

    protected async getRelistPrice(executionReport: ExecutionReport): Promise<string> {
        const { symbol, priceLastTrade, price } = executionReport;

        const incomingPrice = priceLastTrade || price;
        const decreasedPrice = this.subTicks(symbol, incomingPrice);

        const highestBid = await this.marketplace.getHighestBid(symbol);

        return Math.min(+highestBid, +decreasedPrice).toString();
    }

    protected async getStartPrice(symbol: string): Promise<string> {
        return await this.marketplace.getLowestAsk(symbol);
    }

    private subTicks(symbol: string, price: string) {
        const tickSize = this.marketplace.exchangeInfo.getTickSize(symbol);
        const decreaseAmount = Calc.mul(tickSize, DEFAULTS.NUM_TICKS_CHANGED);
        return Calc.sub(price, decreaseAmount);
    }
}

export default ShortStrategy;