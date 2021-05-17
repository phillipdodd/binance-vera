export enum User {
    Phil = "PHIL",
    Tom = "TOM",
}

export const InitPairs = {
    [User.Phil]: [
        "DOGEUSD"
    ],
    [User.Tom]: [
        "DOGEUSD"
    ]
}

export enum TradePosition {
    Long = "Long",
    Short = "Short",
};

export enum TradeSide {
    Buy = "BUY",
    Sell = "SELL",
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