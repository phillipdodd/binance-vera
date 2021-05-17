import EventListener from "./EventSystem/EventListener";
import EventManager from "./EventSystem/EventManager";
import EventType from "./EventSystem/EventType";
import Instance from "./Instance";
import WinstonLogger from "./WinstonLogger";

class LogManager implements EventListener {
    public logger = WinstonLogger;
    private instance: Instance;

    constructor(instance: Instance) {
        this.instance = instance;
        this.instance.events.subscribe("AppInitialized", this);
        this.instance.events.subscribe("OrderFilled", this);
        this.instance.events.subscribe("OrderPlaced", this);
    }

    update(eventType: EventType, data: any): void {
        switch (eventType) {
            case "AppInitialized":
                this.logger.info("Event: AppInitialized");
                break;
            
            case "OrderFilled":
                this.logger.info("Event: OrderFilled");
                this.logger.debug(data);
                break;
            
            case "OrderPlaced":
                this.logger.info("Event: OrderPlaced");
                this.logger.debug(data);
                break;
        
            default:
                break;
        }
    }
}

export default LogManager;