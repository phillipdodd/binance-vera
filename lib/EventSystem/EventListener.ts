import EventType from "./EventType";

interface EventListener {
    update(eventType: EventType, data: any): void;
}

export default EventListener;