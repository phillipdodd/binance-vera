import { ExecutionReport, NewOrder, OrderSide, OrderType } from "us-binance-api-node";
import { USER_CONFIG } from "../../constants";
import Calc from "../Calc";
import Instance from "../Instance";

abstract class OrderStrategy {

    protected instance: Instance;
    abstract startSide: OrderSide;

    constructor(instance: Instance) {
        this.instance = instance;
    }

    //todo needs  check for min notional somewhere
    
    public async getInitialOrderOptions(symbol: string): Promise<NewOrder> {
        const type = <OrderType>'LIMIT';
        const price = await this.getStartPrice(symbol);
        const quantity = this.getStartQuantity(price);
        const side = this.startSide;

        return this.correctTickAndStep(({
            symbol, type, price, quantity, side
        } as NewOrder));
    }

    public async getRelistOrderOptions(executionReport: ExecutionReport): Promise<NewOrder> {
        const symbol = executionReport.symbol;
        const type = <OrderType>'LIMIT';
        const price = await this.getPrice(executionReport);
        const quantity = this.getQuantity(executionReport, price);
        const side = this.getSide(executionReport);

        return this.correctTickAndStep(({
            symbol, type, price, quantity, side
        } as NewOrder));
    }
    
    //todo remove this, combine with price and quantity functions
    protected correctTickAndStep(options: NewOrder) {
        //* Market orders will not be including a 'price' property
        if (options.hasOwnProperty("price")) {
            options.price = Calc.roundToTickSize(options.price, this.instance.exchangeInfo.getTickSize(options.symbol));
        }

        if (options.hasOwnProperty("quantity")) {
            options.quantity = Calc.roundToStepSize(options.quantity, this.instance.exchangeInfo.getStepSize(options.symbol));
        }

        return options;
    }

    protected async getPrice(executionReport: ExecutionReport) : Promise<string> {
        if (executionReport.side === this.startSide) {
            return await this.getRelistPrice(executionReport);
        } else {
            return await this.getStartPrice(executionReport.symbol);
        }
    }

    protected abstract getRelistPrice(executionReport: ExecutionReport): Promise<string>;
    protected abstract getStartPrice(symbol: string): Promise<string>;

    protected getQuantity(executionReport: ExecutionReport, price: string) : string {
        if (executionReport.side === this.startSide) {
            return this.getRelistQuantity(executionReport);
        } else {
            return this.getStartQuantity(price);
        }
    }

    private getRelistQuantity(executionReport: ExecutionReport): string {
        return executionReport.quantity;
    }

    private getStartQuantity(price: string): string {
        const buyIn = USER_CONFIG[this.instance.user].BUY_IN;
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