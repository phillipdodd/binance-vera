import { ExecutionReport, OrderSide } from "us-binance-api-node";
import Instance from "./Instance";




abstract class PriceController {
    constructor(protected instance: Instance) { }
    
    getHandler(side: OrderSide): IPriceHandler {
        if (side === "BUY") {
            return this.handleBuy;
        } else {
            return this.handleSell;
        }
    }

    abstract handleBuy(ex: Partial<ExecutionReport>): Promise<PriceData>;
    abstract handleSell(ex: Partial<ExecutionReport>): Promise<PriceData>;
}

type PriceData = {
    price: string;
    quantity: string;
}

interface IPriceHandler {
    (ex: Partial<ExecutionReport>): Promise<PriceData>;
}

export { PriceController, PriceData };