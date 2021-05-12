import { ExecutionReport, OrderSide } from "us-binance-api-node";
import Instance from "./Instance";
import { PriceController, PriceData } from "./PriceController";

class ShortPriceController extends PriceController {
    
    constructor(instance: Instance) {
        super(instance);
    }

    async handleBuy(ex: ExecutionReport): Promise<PriceData> {
        const price = await this.instance.getHighestBid(ex.symbol);
        const quantity = this.instance.getOrderQuantity(price);
        return { price, quantity };
    }

    async handleSell(ex: ExecutionReport): Promise<PriceData> {
        const price = await this.instance.getRelistAskPrice(ex.symbol, ex.price, ex.priceLastTrade);
        const quantity = ex.quantity;
        return { price, quantity };
    }
    
}

export default ShortPriceController;