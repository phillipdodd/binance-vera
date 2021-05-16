import EventManager from "../lib/EventSystem/EventManager";
import EventType from "../lib/EventSystem/EventType";
import EventListener from "../lib/EventSystem/EventListener";

class Publisher {
    constructor(public events: EventManager = new EventManager()) { }
    
    public sendEvent(eventType: EventType, data: any) {
        this.events.notify(eventType, data);
    }
}

class Subscriber implements EventListener {
    
    update(eventType: EventType, data: any): void {
        console.log('bing');
        return;
    }

}

const publisher = new Publisher();
const subscriber = new Subscriber();
const event: EventType = "OrderFilled";

it('can add subscribers', () => {
    publisher.events.subscribe(event, subscriber);
    expect(publisher.events.hasSubscriber(event, subscriber)).toBe(true);
});

test.todo('can notify subscribers of events');
test.todo('can send data along with event');

it('can delete subscribers', () => {
    publisher.events.unsubscribe(event, subscriber);
    expect(publisher.events.hasSubscriber(event, subscriber)).toBe(false);
});

