import Instance from "../Instance";
import EventListener from "./EventListener";
import Event from "../Events/Event";

class EventManager {

    private instance: Instance;
    private listeners: Map<string, Set<EventListener>>;

    constructor(instance: Instance) {
        this.instance = instance;
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
            this.instance.logger.debug(`Event: ${event.name} - `);
            this.instance.logger.debug(event.args);
        } else {
            this.instance.logger.debug(`Event: ${event.name} - ${event.args || "null"}`);
        }
    }
}

export default EventManager;