import { ExecutionReport, OrderSide } from "us-binance-api-node";
import { PriceController, PriceData } from "./PriceController";
import Instance from "../Instance";
import SimplifiedExchangeInfo from "../SimplifiedExchangeInfo";

class LongPriceController extends PriceController  {

    constructor(instance: Instance) {
        super(instance);
    }

    async handleBuy(ex: Partial<ExecutionReport>): Promise<PriceData> {
        const price = await this.instance.getHighestBid(<string>ex.symbol);
        const quantity = this.getOrderQuantity(price);
        return { price, quantity };
    }

    async handleSell(ex: Partial<ExecutionReport>): Promise<PriceData> {
        const price = await this.getRelistAskPrice(<string>ex.symbol, <string>ex.price, ex.priceLastTrade);
        const quantity = <string>ex.quantity;
        return { price, quantity };
    }
}

export default LongPriceController;