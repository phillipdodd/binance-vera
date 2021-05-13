import { ExecutionReport, OrderSide } from "us-binance-api-node";
import Instance from "./Instance";
import { PriceController, PriceData } from "./PriceController";

class ShortPriceController extends PriceController {
    
    constructor(instance: Instance) {
        super(instance);
    }

    async handleBuy(ex: Partial<ExecutionReport>): Promise<PriceData> {
        const price = await this.getRelistBidPrice(<string>ex.symbol, <string>ex.price);
        const quantity = <string>ex.quantity;
        return { price, quantity };
    }

    async handleSell(ex: Partial<ExecutionReport>): Promise<PriceData> {
        const price = await this.instance.getLowestAsk(<string>ex.symbol);
        const quantity = this.getOrderQuantity(price);
        return { price, quantity };
    }
    
}

export default ShortPriceController;