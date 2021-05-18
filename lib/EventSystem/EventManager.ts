import Instance from "../Instance";
import EventType from "./EventType";
import EventListener from "./EventListener";

class EventManager {

    private instance: Instance;
    private listeners: Map<EventType, Set<EventListener>>;

    constructor(instance: Instance) {
        this.instance = instance;
        this.listeners = new Map();
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

    public notify(eventType: EventType, data: any) {
        this.logEvent(eventType, data)
        const listenerSet = this.listeners.get(eventType);
        listenerSet?.forEach(listener => {
            listener.update(eventType, data);
        });
    }
    
    private logEvent(eventType: EventType, data: any) {
        if (data && typeof data === "object") {
            this.instance.logger.debug(`Event: ${eventType} - `);
            this.instance.logger.debug(data);
        } else {
            this.instance.logger.debug(`Event: ${eventType} - ${data || "null"}`);
        }
    }
}

export default EventManager;