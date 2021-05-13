import { ExecutionReport, OutboundAccountInfo } from "us-binance-api-node";
import Instance from "./Instance";

class WebsocketManager {
    private instance: Instance;
    private websocketClosers: Map<string, Function>;
    
    constructor(instance: Instance) {
        this.instance = instance;
        this.websocketClosers = new Map();
    }
    
    async startUserWebsocket(): Promise<void> {
        const userCallback = (eventData: OutboundAccountInfo | ExecutionReport) => {
            if ((eventData as ExecutionReport).orderStatus === 'FILLED') {
                // this.relistLimitOrder(eventData as ExecutionReport);
                //? could this fire an event...?
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