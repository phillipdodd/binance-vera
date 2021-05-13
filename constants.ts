export enum User {
    Phil,
    Tom,
}

export enum TradePosition {
    Long,
    Short,
};

export enum TradeSide {
    BUY,
    SELL,
};

export const CONFIG = {
    BUYIN: 50,
    RELIST_TIME: 60_000,
}

export const DEFAULTS = {
    TRADE_POSITION: TradePosition.Long,
    TO_FIXED_PRECISION: 8,
    NUM_TICKS_CHANGED: 3
}