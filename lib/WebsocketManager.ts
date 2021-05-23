import { ExecutionReport, OutboundAccountInfo } from "us-binance-api-node";
import BinanceMarketplace from "./BinanceMarketplace";
import EventManager from "./EventSystem/EventManager";

class WebsocketManager {
    private binance: BinanceMarketplace;
    private websocketClosers: Map<string, Function>;
    private events: EventManager = EventManager.getEventManager();
    
    constructor(binance: BinanceMarketplace) {
        this.binance = binance;
        this.websocketClosers = new Map();
    }
    
    async startUserWebsocket(): Promise<void> {
        const isExecutionReport = (eventData: OutboundAccountInfo | ExecutionReport) : eventData is ExecutionReport => {
            return (eventData as any).orderStatus !== undefined;
        }

        const userCallback = (eventData: OutboundAccountInfo | ExecutionReport) => {
            if (isExecutionReport(eventData)) {
                if (eventData.orderStatus === 'FILLED') {
                    this.events.notify("OrderFilled", eventData);
                }
            }
        }

        const userWebsocketCloser = await this.binance.client.ws.user(userCallback);
        this.websocketClosers.set('user', userWebsocketCloser);
    }

    closeAllWebsockets() {
        this.websocketClosers.forEach(ws => ws());
        this.websocketClosers.clear();
    }

    getOpenWebsocketCount(): number {
        return this.websocketClosers.size;
    }
}

export default WebsocketManager;