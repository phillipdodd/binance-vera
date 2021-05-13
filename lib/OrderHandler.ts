import { ExecutionReport, NewOrder, OrderSide } from "us-binance-api-node";
import { CONFIG, TradePosition } from "../constants";
import Calc from "./Calc";
import Instance from "./Instance";
import { PriceController } from "./PriceController";
import LongPriceController from "./LongPriceController";
import ShortPriceController from "./ShortPriceController";

class OrderHandler {

    private instance: Instance;
    private priceControllers: Map<TradePosition, PriceController>;
    private activeOrders: Map<number, TradePosition>;

    constructor(instance: Instance) {
        this.instance = instance;

        this.priceControllers = new Map();
        this.priceControllers.set(TradePosition.Long, new LongPriceController(instance));
        this.priceControllers.set(TradePosition.Short, new ShortPriceController(instance));

        this.activeOrders = new Map();
    }
    
    async placeInitOrder(symbol: string, forPosition: TradePosition) {
        const initSide = getInitOrderSide(forPosition);
        const priceController = <PriceController>this.priceControllers.get(forPosition);
        const handler = priceController.getHandler(initSide);
        const { price, quantity } = await handler({ symbol });
        const initOrder = await this.placeOrder({
            symbol,
            quantity,
            price,
            side: <OrderSide>initSide,
            type: "LIMIT",
        });

        this.activeOrders.set(initOrder.orderId, forPosition);
        await this.createTimerForOrder(symbol, initOrder.orderId);

        return initOrder;
    }

    async relistLimitOrder(executionReport: ExecutionReport) {
        const { symbol, orderId, side } = executionReport;
        const forPosition = this.getPositionOrderPlacedIn(orderId);
        const relistSide = reverseSide(side);

        const priceController = <PriceController>this.priceControllers.get(forPosition);
        const handler = priceController.getHandler(relistSide);
        const { price, quantity } = await handler(executionReport);

        const relistOrder = await this.placeOrder({
            symbol,
            quantity,
            price,
            side: <OrderSide>relistSide,
            type: "LIMIT",
        });

        this.activeOrders.set(relistOrder.orderId, forPosition);
        this.activeOrders.delete(executionReport.orderId);

        await this.createTimerForOrder(symbol, relistOrder.orderId);

        return relistOrder;
    }

    async placeOrder(options: NewOrder) {
        const correctedOptions: NewOrder = this.correctTickAndStep(options);
        const order = await this.instance.client.order(correctedOptions);
        return order;
    }

    async createTimerForOrder(symbol: string, orderId: any) {
        throw new Error('not implemented');
    }

    async cancelOrder(symbol: string, orderId: number) {
        await this.instance.client.cancelOrder({ symbol, orderId });
        this.activeOrders.delete(orderId);
    }

    correctTickAndStep(options: NewOrder) {
        //* Market orders will not be including a 'price' property
        if (options.hasOwnProperty("price")) {
            options.price = Calc.roundToTickSize(options.price, this.instance.exchangeInfo.getTickSize(options.symbol));
        }

        if (options.hasOwnProperty("quantity")) {
            options.quantity = Calc.roundToStepSize(options.quantity, this.instance.exchangeInfo.getStepSize(options.symbol));
        }

        return options;
    }

    getPositionOrderPlacedIn(orderId: number) {
        const tradePosition = this.activeOrders.get(orderId);
        return tradePosition || this.instance.getTradePosition();
    }

}

function reverseSide(orderSide: OrderSide) {
    if (orderSide === "BUY") {
        return "SELL";
    } else {
        return "BUY"
    }
}

function getInitOrderSide(position: TradePosition): OrderSide {
    if (position === TradePosition.Short) {
        return "SELL";
    } else {
        return "BUY";
    }
}

export default OrderHandler;