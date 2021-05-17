export enum User {
    Phil = "PHIL",
    Tom = "TOM",
}

export const USER_CONFIG = {
    [User.Phil]: {
        BUY_IN: 50,
        INIT_SYMBOLS: [
            "DOGEUSD"
        ]
    },
    [User.Tom]: {
        BUY_IN: 50,
        INIT_SYMBOLS: [
            "DOGEUSD"
        ]
    }
}

export enum TradeSide {
    Buy = "BUY",
    Sell = "SELL",
};

export const CONFIG = {
    RELIST_TIME: 60_000,
}

export const DEFAULTS = {
    TO_FIXED_PRECISION: 8,
    NUM_TICKS_CHANGED: 3
}