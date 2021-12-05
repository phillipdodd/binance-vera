import { ExecutionReport, NewOrder, OrderSide, OrderType } from "us-binance-api-node";
import { USER_CONFIG } from "../../constants";
import BinanceMarketplace from "../BinanceMarketplace";
import Calc from "../Calc";

abstract class OrderStrategy {

    protected marketplace: BinanceMarketplace;

    abstract startSide: OrderSide;

    constructor(marketplace: BinanceMarketplace) {
        this.marketplace = marketplace;
    }

    //todo needs  check for min notional somewhere
    
    public async getInitialOrderOptions(symbol: string): Promise<NewOrder> {
        const type = <OrderType>'LIMIT';
        const price = await this.getStartPrice(symbol);
        const quantity = this.getStartQuantity(price);
        const side = this.startSide;

        return {
            symbol, type, price, quantity, side
        } as NewOrder;
    }

    public async getRelistOrderOptions(executionReport: ExecutionReport): Promise<NewOrder> {
        const symbol = executionReport.symbol;
        const type = <OrderType>'LIMIT';
        const price = await this.getPrice(executionReport);
        const quantity = this.getQuantity(executionReport, price);
        const side = this.getSide(executionReport);

        return {
            symbol, type, price, quantity, side
        } as NewOrder;
    }

    protected async getPrice(executionReport: ExecutionReport) : Promise<string> {
        const tickSize = this.marketplace.exchangeInfo.getTickSize(executionReport.symbol);
        
        let price;
        if (executionReport.side === this.startSide) {
            price = await this.getRelistPrice(executionReport);
        } else {
            price = await this.getStartPrice(executionReport.symbol);
        }

        return Calc.roundToTickSize(price, tickSize);
    }

    protected abstract getRelistPrice(executionReport: ExecutionReport): Promise<string>;
    protected abstract getStartPrice(symbol: string): Promise<string>;

    protected getQuantity(executionReport: ExecutionReport, price: string): string {
        const stepSize = this.marketplace.exchangeInfo.getStepSize(executionReport.symbol);

        let quantity;
        if (executionReport.side === this.startSide) {
            quantity = this.getRelistQuantity(executionReport);
        } else {
            quantity = this.getStartQuantity(price);
        }

        return Calc.roundToStepSize(quantity, stepSize)
    }

    private getRelistQuantity(executionReport: ExecutionReport): string {
        return executionReport.quantity;
    }

    private getStartQuantity(price: string): string {
        const buyIn = USER_CONFIG[this.marketplace.user].BUY_IN;
        return Calc.div(buyIn, price).toString();
    }

    protected getSide(executionReport: ExecutionReport): OrderSide {
        if (executionReport.side === 'BUY') {
            return <OrderSide>'SELL';
        } else {
            return <OrderSide>'BUY';
        }
    }
    
}

export default OrderStrategy;