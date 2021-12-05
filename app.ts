import winston from "winston";
import WinstonLogger from "./lib/WinstonLogger";
import { User, USER_CONFIG } from "./constants";
import BinanceMarketplace from "./lib/BinanceMarketplace";
import Event from "./lib/Events/Event";
import EventListener from "./lib/EventSystem/EventListener";
import EventManager from "./lib/EventSystem/EventManager";
import OrderHandler from "./lib/OrderHandler";
import { ExecutionReport } from "us-binance-api-node";
import OrderStrategy from "./lib/OrderStrategy/OrderStrategy";
import StrategyShouldChange from "./lib/Events/StrategyShouldChange";
import OrderShouldCancel from "./lib/Events/OrderShouldCancel";
import OrderFilled from "./lib/Events/OrderFilled";

class App implements EventListener {

    public events: EventManager;
    public logger: winston.Logger;

    private user: User;
    private marketplace: BinanceMarketplace;
    private orderHandler: OrderHandler;

    private eventHandlers: Map<String, Function> = new Map();

    constructor(user: User) {
        this.events = new EventManager();
        this.logger = WinstonLogger;
        this.user = user;
        this.marketplace = new BinanceMarketplace(user, this.events);
        this.orderHandler = new OrderHandler(this.marketplace);

        this.eventHandlers.set("AppInitialized", this.onAppInitialized)
        this.eventHandlers.set("OrderFilled", this.onOrderFilled)
        this.eventHandlers.set("OrderShouldCancel", this.onOrderShouldCancel)
        this.eventHandlers.set("StrategyShouldChange", this.onStrategyShouldChange)
    }

    update(event: Event): void {
        const handler = this.eventHandlers.get(event.name)
        if (handler) {
            handler(event);
        }
    }

    private async onAppInitialized() {
        const initSymbols = USER_CONFIG[this.user].INIT_SYMBOLS;
        console.log('in testing mode! onAppInitialized() triggered')
        for (const symbol of initSymbols) {
            try {
                // await this.orderHandler.initOrder(symbol);
            } catch (error) {
                this.logger.error(`initOrder - ${symbol} - ${(error as Error).message}`);
            }
        }
    }

    private async onOrderFilled(event: OrderFilled) {
        const { executionReport } = event.args;
        try {
            await this.orderHandler.relistOrder(executionReport);
        } catch (error) {
            this.logger.error(`handleOrderFilled - ${executionReport.symbol} ${executionReport.orderId} - ${(error as Error).message}`);
        }
    }

    private async onOrderShouldCancel(event: OrderShouldCancel) {
        const { cancelOrderResult } = event.args;
        await this.marketplace.cancelOrder(
            cancelOrderResult.symbol,
            cancelOrderResult.orderId
        );
    }

    private async onStrategyShouldChange(event: StrategyShouldChange) {
        const { targetStrategy } = event.args;
        this.orderHandler.setStrategy(targetStrategy);
    }
}




