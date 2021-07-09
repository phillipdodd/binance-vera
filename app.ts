import BinanceMarketplace from "./lib/BinanceMarketplace";
import { User } from "./constants";
import SimplifiedExchangeInfo from "./lib/SimplifiedExchangeInfo";
import WebsocketManager from "./lib/WebsocketManager";
import EventManager from "./lib/EventSystem/EventManager";
import OrderHandler from "./lib/OrderHandler";
import EventType from "./lib/EventSystem/EventType";
import { ExecutionReport } from "us-binance-api-node";
import OrderStrategy from "./lib/OrderStrategy/OrderStrategy";

class App {
    
    private binance: BinanceMarketplace;
    private websocketManager: WebsocketManager;
    private events: EventManager = EventManager.getEventManager();
    public orderHandler: OrderHandler;

    public readonly exchangeInfo: SimplifiedExchangeInfo;

    constructor(user: User) {
        this.binance = new BinanceMarketplace(user);
        this.websocketManager = new WebsocketManager(this.binance);
        this.exchangeInfo = new SimplifiedExchangeInfo(this.binance);
        this.orderHandler = new OrderHandler(this.binance, this.exchangeInfo);
    }

    async init() {
        await this.exchangeInfo.init();
        await this.websocketManager.startUserWebsocket();

        this.events.subscribe("AppInitialized", this);
        this.events.subscribe("OrderFilled", this);
        this.events.subscribe("OrderShouldCancel", this);
        this.events.subscribe("StrategyShouldChange", this);

        this.events.notify("AppInitialized");
    }

    public update(eventType: EventType, data: any): void {
        switch (eventType) {
            case "AppInitialized":
                this.onAppInitialized()
                break;
            
            case "OrderFilled":
                this.onOrderFilled(data);
                break;
            
            case "OrderShouldCancel":
                this.onOrderShouldCancel(data);
                break;
            
            case "StrategyShouldChange":
                this.onStrategyShouldChange(data);
                break;
        
            default:
                break;
        }
    }

    onAppInitialized() {
        this.orderHandler.placeInitialOrders();
    }

    async onOrderFilled(data: any) {
        const orderResponse = await this.orderHandler.relistOrder(<ExecutionReport>data);
        this.events.notify("OrderPlaced", orderResponse);
    }

    async onOrderShouldCancel(data: any) {
        await this.orderHandler.cancelOrder(data.symbol, data.orderId);
        this.events.notify("OrderCancelled", data.orderId);
    }

    onStrategyShouldChange(data: any) {
        this.orderHandler.setStrategy(<OrderStrategy>data);
        this.events.notify("StrategyDidChange", data);
    }
}

const app = new App(User.Phil);
(async () => {
    await app.init();
})()
