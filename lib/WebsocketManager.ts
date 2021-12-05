import { ExecutionReport, OutboundAccountInfo } from "us-binance-api-node";
import OrderFilled from "./Events/OrderFilled";
import Instance from "./maybe not used/Instance";

class WebsocketManager {
    private instance: Instance;
    private websocketClosers: Map<string, Function>;
    
    constructor(instance: Instance) {
        this.instance = instance;
        this.websocketClosers = new Map();
    }
    
    async startUserWebsocket(): Promise<void> {
        const isExecutionReport = (eventData: OutboundAccountInfo | ExecutionReport) : eventData is ExecutionReport => {
            return (eventData as any).orderStatus !== undefined;
        }

        const userCallback = (eventData: OutboundAccountInfo | ExecutionReport) => {
            if (isExecutionReport(eventData)) {
                if (eventData.orderStatus === 'FILLED') {
                    const orderFilledEvent = new OrderFilled(eventData);
                    this.instance.events.notify(orderFilledEvent);
                }
            }
        }

        const userWebsocketCloser = await this.instance.client.ws.user(userCallback);
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