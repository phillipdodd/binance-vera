export enum User {
    Phil,
    Tom,
}

export enum State {
    Long,
    Short,
};

export enum TradePosition {
    Long,
    Short,
};

export enum TradeSide {
    BUY,
    SELL,
};

export const CONFIG = {
    DEFAULT_STATE: State.Long,
    BUYIN: 50,
    RELIST_TIME: 60_000
}