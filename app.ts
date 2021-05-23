import BinanceMarketplace from "./lib/BinanceMarketplace";
import { User } from "./constants";
import SimplifiedExchangeInfo from "./lib/SimplifiedExchangeInfo";
import WebsocketManager from "./lib/WebsocketManager";
import EventManager from "./lib/EventSystem/EventManager";
import OrderHandler from "./lib/OrderHandler";

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

        this.events.notify("AppInitialized");
    }
}

const app = new App(User.Phil);
(async () => {
    await app.init();
})()
