import Event from "../Events/Event";

interface EventListener {
    update(event: Event): void;
}

export default EventListener;