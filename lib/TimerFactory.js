const { Config } = require("../constants.js");

class TimerFactory {
    constructor(instance) {
        this.instance = instance;
        this.activeTimers = new Map();
    }

    createTimer(orderId, fn, t) {
        const cb = () => {
            fn();
            this.activeTimers.delete(orderId);
        };
        const timer = setTimeout(cb, t);
        this.activeTimers.set(orderId, timer);
    }
}

module.exports = TimerFactory;
