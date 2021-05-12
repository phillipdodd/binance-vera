import { TradePosition, TradeSide } from "../constants";
import Instance from "./Instance";

//todo change language of 'state' to 'tradeposition'
export default class TimerManager {

    private instance: Instance;
    private activeTimers: Map<string, NodeJS.Timeout>;

    private resetTime: number;
    private positionChangeTime: number;

    constructor(instance: Instance) {
        this.instance = instance;
        this.activeTimers = new Map();

        this.resetTime = 60_000;
        this.positionChangeTime = 120_000;
    }

    public shouldCreateRelistTimer(tradePosition: TradePosition, side: TradeSide): boolean {
        if (tradePosition === TradePosition.Long && side === TradeSide.BUY) {
            return true;
        }
        if (tradePosition === TradePosition.Short && side === TradeSide.SELL) {
            return true;
        }
        return false;
    }

    public createResetTimer(orderId: string): void {
        const timer = setTimeout(() => {
            this.activeTimers.delete(orderId);
            //todo reset order
        }, this.positionChangeTime);
        this.activeTimers.set(orderId, timer);
    }

    public createPositionChangeTimer(orderId: string): void {
        const timer = setTimeout(() => {
            this.instance.toggleTradePosition();
            if (this.activeTimers.has(orderId)) {
                this.activeTimers.delete(orderId);
            }
        }, this.positionChangeTime);
        this.activeTimers.set(orderId, timer);
    }

    public deleteTimer(orderId: string): void {
        const timeout = this.activeTimers.get(orderId);
        if (timeout) {
            clearTimeout(timeout);
            this.activeTimers.delete(orderId);
        }
    }

}