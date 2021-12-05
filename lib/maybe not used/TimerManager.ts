// import { OrderSide } from "us-binance-api-node";
// import { CONFIG } from "../../constants";
// import OrderPlaced from "../Events/OrderPlaced";
// import EventListener from "../EventSystem/EventListener";
// import EventType from "../EventSystem/EventType";
// import Instance from "./Instance";
// import OrderHandler from "../OrderHandler";

// export default class TimerManager implements EventListener {

//     private instance: Instance;
//     private activeTimers: Map<string, NodeJS.Timeout>;
//     private orderHandler: OrderHandler;

//     constructor(instance: Instance, orderHandler: OrderHandler) {
//         this.instance = instance;
//         this.orderHandler = orderHandler;

//         this.instance.events.subscribe(new OrderPlaced(), this);
//         this.instance.events.subscribe("OrderFilled", this);
//         this.instance.events.subscribe("OrderCancelled", this);

//         this.activeTimers = new Map();
//     }

//     public update(eventType: EventType, data: any): void {
//         switch (eventType) {
//             case "OrderPlaced":
//                 this.onOrderPlaced(data);
//                 break;
    
//             case "OrderFilled":
//                 this.onOrderFilled(data);
//                 break;
            
//             case "OrderCancelled":
//                 this.deleteTimer(data);
//                 break;
            
//             default:
//                 break;
//         }
//     }
    
//     private onOrderPlaced(data: {side: OrderSide, orderId: string}) {
//         const orderStrategy = this.orderHandler.getStrategy();
//         if (data.side === orderStrategy.startSide) {
//             this.createResetTimer(data.orderId);
//         } else {
//             this.createChangeStrategyTimer(data.orderId);
//         }
//     }

//     private onOrderFilled(orderId: string) {
//         this.deleteTimer(orderId);
//     }

//     public createResetTimer(orderId: string) {
//         const timer = setTimeout(() => {
//             this.instance.events.notify("OrderShouldCancel", orderId);
//         }, CONFIG.RESET_TIME);
//         this.activeTimers.set(orderId, timer);
//     }

//     public createChangeStrategyTimer(orderId: string) {
//         const timer = setTimeout(() => {
//             this.instance.events.notify("StrategyShouldChange", null);
//             this.deleteTimer(orderId);
//         }, CONFIG.CHANGE_STRATEGY_TIME);
//         this.activeTimers.set(orderId, timer);
//     }

//     public deleteTimer(orderId: string) {
//         const timeout = this.activeTimers.get(orderId);
//         if (timeout) {
//             clearTimeout(timeout);
//             this.activeTimers.delete(orderId);
//         }
//     }

// }