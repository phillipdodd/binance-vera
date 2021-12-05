import winston, { loggers } from "winston";
import WinstonLogger from "./lib/WinstonLogger";
import { User, USER_CONFIG } from "./constants";
import BinanceMarketplace from "./lib/BinanceMarketplace";
import Event from "./lib/Events/Event";
import EventListener from "./lib/EventSystem/EventListener";
import EventManager from "./lib/EventSystem/EventManager";
import StrategyShouldChange from "./lib/Events/StrategyShouldChange";
import OrderShouldCancel from "./lib/Events/OrderShouldCancel";
import OrderFilled from "./lib/Events/OrderFilled";

class App implements EventListener {

    public events: EventManager;
    public logger: winston.Logger;

    private user: User;
    private marketplace: BinanceMarketplace;

    private eventHandlers: Map<String, Function> = new Map();

    constructor(user: User) {
        this.events = new EventManager();
        this.logger = WinstonLogger;
        this.user = user;
        this.marketplace = new BinanceMarketplace(user, this.events);

        this.events.subscribe("AppInitialized", this);
        this.eventHandlers.set("AppInitialized", this.onAppInitialized)

        this.events.subscribe("OrderFilled", this);
        this.eventHandlers.set("OrderFilled", this.onOrderFilled)
        
        this.events.subscribe("OrderShouldCancel", this);
        this.eventHandlers.set("OrderShouldCancel", this.onOrderShouldCancel)
        
        this.events.subscribe("StrategyShouldChange", this);
        this.eventHandlers.set("StrategyShouldChange", this.onStrategyShouldChange)
    }

    async init() {
        this.marketplace.init();
    }

    update(event: Event): void {
        const handler = this.eventHandlers.get(event.name)
        if (handler) {
            handler.apply(this, [event]);
        }
    }

    private async onAppInitialized() {
        console.log('onAppInitialized')
        const initSymbols = USER_CONFIG[this.user].INIT_SYMBOLS;
        console.log('in testing mode! onAppInitialized() triggered')
        for (const symbol of initSymbols) {
            try {
                // await this.marketplace.initOrder(symbol);
            } catch (error) {
                this.logger.error(`initOrder - ${symbol} - ${(error as Error).message}`);
            }
        }
    }

    private async onOrderFilled(event: OrderFilled) {
        const { executionReport } = event.args;
        try {
            await this.marketplace.relistOrder(executionReport);
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
        this.marketplace.setStrategy(targetStrategy);
    }
}

(async () => {
    const app = new App(User.Phil);
    await app.init();
})()