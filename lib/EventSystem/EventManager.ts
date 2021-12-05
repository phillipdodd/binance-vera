import EventListener from "./EventListener";
import Event from "../Events/Event";
import winston from "winston";
import WinstonLogger from "../WinstonLogger";

class EventManager {

    private logger: winston.Logger;
    private listeners: Map<string, Set<EventListener>>;

    constructor() {
        this.logger = WinstonLogger;
        this.listeners = new Map();
     }
    
    public subscribe(event: Event, listener: EventListener) {
        if (!this.listeners.has(event.name)) {
            this.listeners.set(event.name, new Set());
        }
        this.listeners.get(event.name)?.add(listener);
    }

    public hasSubscriber(event: Event, listener: EventListener) {
        return this.listeners.get(event.name)?.has(listener);
    }

    public unsubscribe(event: Event, listener: EventListener) {
        this.listeners.get(event.name)?.delete(listener);
    }

    public notify(event: Event) {
        this.logEvent(event)
        const listenerSet = this.listeners.get(event.name);
        listenerSet?.forEach(listener => {
            listener.update(event);
        });
    }
    
    private logEvent(event: Event) {
        if (event.args && typeof event.args === "object") {
            this.logger.debug(`Event: ${event.name} - `);
            this.logger.debug(event.args);
        } else {
            this.logger.debug(`Event: ${event.name} - ${event.args || "null"}`);
        }
    }
}

export default EventManager;