interface Instance {
    toggleTradePosition: Function;
}
enum TradePosition { LONG, SHORT }
enum TradeSide {BUY, SELL}

class ActiveOrderManager {

    private activeOrders: Map<string, TradePosition>;
    private timerManager: TimerManager;

    constructor(instance: Instance) {
        this.activeOrders = new Map < string, TradePosition > ();
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

class TimerManager {

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
        if (tradePosition === TradePosition.LONG && side === TradeSide.BUY) {
            return true;
        }
        if (tradePosition === TradePosition.SHORT && side === TradeSide.SELL) {
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