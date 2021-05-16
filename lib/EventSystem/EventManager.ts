import EventType from "./EventType";
import EventListener from "./EventListener";

class EventManager {

    private listeners: Map<EventType, Set<EventListener>>;

    constructor() {
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
        const listenerSet = this.listeners.get(eventType);
        listenerSet?.forEach(listener => {
            listener.update(eventType, data);
        });
    }
}

export default EventManager;