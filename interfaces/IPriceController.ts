import { ExecutionReport } from "us-binance-api-node";
import PriceData from "../types/PriceData";


export default interface IPriceController {
    handleBuy(ex: ExecutionReport): Promise<PriceData>;
    handleSell(ex: ExecutionReport): Promise<PriceData>;
}