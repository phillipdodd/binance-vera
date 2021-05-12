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
    DEFAULT_STATE: TradePosition.Long,
    BUYIN: 50,
    RELIST_TIME: 60_000,
    DEFAULT_TO_FIXED: 8
}