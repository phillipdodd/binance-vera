import { ExecutionReport } from "us-binance-api-node";
import IPriceController from "../interfaces/IPriceController";
import PriceData from "../types/PriceData";
import Instance from "./Instance";

class ShortPriceController implements IPriceController {
    
    private instance: Instance;

    constructor(instance: Instance) {
        this.instance = instance;
    }
    
    async handleBuy(ex: ExecutionReport): Promise<PriceData> {
        const price = await this.instance.getRelistBidPrice(ex.symbol, ex.price, ex.priceLastTrade);
        const quantity = ex.quantity;
        return { price, quantity };
    }
    
    async handleSell(ex: ExecutionReport): Promise<PriceData> {
        const price = await this.instance.getLowestAsk(ex.symbol);
        const quantity = this.instance.getOrderQuantity(price);
        return { price, quantity };
    }
    
}

export default ShortPriceController;