import { ExecutionReport, NewOrder, OrderSide, OrderType } from "us-binance-api-node";
import { CONFIG } from "../../constants";
import Calc from "../Calc";
import Instance from "../Instance";

abstract class OrderStrategy {

    protected instance: Instance;
    abstract startSide: OrderSide;

    constructor(instance: Instance) {
        this.instance = instance;
    }

    protected async getOrderOptions(executionReport: ExecutionReport): Promise<NewOrder> {
        const symbol = executionReport.symbol;
        const type = <OrderType>'LIMIT';
        const price = await this.getPrice(executionReport);
        const quantity = this.getQuantity(executionReport, price);
        const side = this.getSide(executionReport);

        return this.correctTickAndStep(({
            symbol, type, price, quantity, side
        } as NewOrder));
    }
    
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
            return await this.getStartPrice(executionReport);
        }
    }

    protected abstract getRelistPrice(executionReport: ExecutionReport): Promise<string>;
    protected abstract getStartPrice(executionReport: ExecutionReport): Promise<string>;

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
        return Calc.div(CONFIG.BUYIN, price).toString();
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