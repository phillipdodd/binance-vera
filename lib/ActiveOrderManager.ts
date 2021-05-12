import { TradePosition, TradeSide } from "../constants";
import Instance from "./Instance";
import TimerManager from "./TimerManager";

export default class ActiveOrderManager {

    private activeOrders: Map<string, TradePosition>;
    private timerManager: TimerManager;

    constructor(instance: Instance) {
        this.activeOrders = new Map<string, TradePosition>();
        this.timerManager = new TimerManager(instance);
    }

    public add(orderId: string, tradePosition: TradePosition, tradeSide: TradeSide) {
        this.activeOrders.set(orderId, tradePosition);

        if (this.timerManager.shouldCreateRelistTimer(tradePosition, tradeSide)) {
            this.timerManager.createResetTimer(orderId);
        } else {
            this.timerManager.createPositionChangeTimer(orderId);
        }
    }

    public delete(orderId: string) {
        this.activeOrders.delete(orderId);
        this.timerManager.deleteTimer(orderId);
    }
}