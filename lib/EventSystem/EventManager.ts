import EventType from "./EventType";
import EventListener from "./EventListener";
import LogManager from "../LogManager";
import winston from "winston";

class EventManager {

    private listeners: Map<EventType, Set<EventListener>>;
    private logger: winston.Logger = LogManager.getLogger();

    static instance: EventManager;

    constructor() {
        this.listeners = new Map();
    }

    public static getEventManager() {
        if (this.instance === undefined) {
            this.instance = new EventManager();
        }
        return this.instance;
    }
    
    public subscribe(eventType: EventType, listener: EventListener) {
        if (!this.listeners.has(eventType)) {
            this.listeners.set(eventType, new Set());
        }
        this.listeners.get(eventType)?.add(listener);
    }

    public hasSubscriber(eventType: EventType, listener: EventListener) {
        return this.listeners.get(eventType)?.has(listener);
    }

    public unsubscribe(eventType: EventType, listener: EventListener) {
        this.listeners.get(eventType)?.delete(listener);
    }

    //todo could this be a static method to get rid of this. references in emitting classes?
    public notify(eventType: EventType, data?: any) {
        this.logEvent(eventType, data)
        const listenerSet = this.listeners.get(eventType);
        listenerSet?.forEach(listener => {
            listener.update(eventType, data);
        });
    }
    
    private logEvent(eventType: EventType, data: any) {
        if (data && typeof data === "object") {
            this.logger.debug(`Event: ${eventType} - `);
            this.logger.debug(data);
        } else {
            this.logger.debug(`Event: ${eventType} - ${data || "null"}`);
        }
    }
}

export default EventManager;