const USERS = {
    PHIL: "PHIL",
    TOM: "TOM",
};

const STATES = {
    LONG: "LONG",
    SHORT: "SHORT",
};

const CONFIG = {
    DEFAULT_STATE: STATES.LONG,
    BUYIN: 50,
    RELIST_TIME: 60_000
}

module.exports = { USERS, STATES, CONFIG };