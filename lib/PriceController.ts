import { ExecutionReport, OrderSide } from "us-binance-api-node";
import { CONFIG, DEFAULTS } from "../constants";
import Calc from "./Calc";
import Instance from "./Instance";
abstract class PriceController {
    constructor(
        protected instance: Instance
    ) { }
    
    abstract handleBuy(ex: Partial<ExecutionReport>): Promise<PriceData>;
    abstract handleSell(ex: Partial<ExecutionReport>): Promise<PriceData>;

    getHandler(side: OrderSide): IPriceHandler {
        if (side === "BUY") {
            return this.handleBuy;
        } else {
            return this.handleSell;
        }
    }

    async getRelistAskPrice(symbol: string, price: string, priceLastTrade?: string) : Promise<string> {
        const incomingPrice = priceLastTrade || price;
        const increasedPrice = this.addTicks(symbol, incomingPrice, DEFAULTS.NUM_TICKS_CHANGED);
        const lowestAsk = await this.instance.getLowestAsk(symbol);
        return Math.max(+lowestAsk, +increasedPrice).toString();
    }

    async getRelistBidPrice(symbol: string, price: string, priceLastTrade?: string) : Promise<string> {
        const incomingPrice = priceLastTrade || price;
        const decreasedPrice = this.subTicks(symbol, incomingPrice, DEFAULTS.NUM_TICKS_CHANGED);
        const highestBid = await this.instance.getHighestBid(symbol);
        return Math.min(+highestBid, +decreasedPrice).toString();
    }

    addTicks(symbol: string, price: string, numTicks = DEFAULTS.NUM_TICKS_CHANGED) {
        const tickSize = this.instance.exchangeInfo.getTickSize(symbol);
        const increaseAmount = Calc.mul(tickSize, numTicks);
        return Calc.add(price, increaseAmount);
    }

    subTicks(symbol: string, price: string, numTicks = DEFAULTS.NUM_TICKS_CHANGED) {
        const tickSize = this.instance.exchangeInfo.getTickSize(symbol);
        const decreaseAmount = Calc.mul(tickSize, numTicks);
        return Calc.sub(price, decreaseAmount);
    }

    getOrderQuantity(price: string): string {
        return Calc.div(CONFIG.BUYIN, price).toString();
    }

}

type PriceData = {
    price: string;
    quantity: string;
}

interface IPriceHandler {
    (ex: Partial<ExecutionReport>): Promise<PriceData>;
}

export { PriceController, PriceData };