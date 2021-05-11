class StateHandlers {
    constructor(instance) {
        this.instance = instance;
        this.handlers = {
            LONG: {
                BUY: undefined,
                SELL: undefined
            },

            SHORT: {
                BUY: undefined,
                SELL: undefined
            }
        }
    }

    async init() {
        this.handlers.LONG.BUY = async ({ symbol } = {}) => {
            let price = await this.instance.getHighestBid(symbol);
            let quantity = await this.instance.getOrderQuantity(price);
            return { price, quantity };
        }

        this.handlers.LONG.SELL = async ({ symbol, price, priceLastTrade, quantity } = {}) => {
            let price = await this.instance.getRelistAskPrice(symbol, price, priceLastTrade);
            return { price, quantity };
        }

        this.handlers.SHORT.BUY = async ({ symbol, price, priceLastTrade, quantity } = {}) => {
            let price = await this.instance.getRelistBidPrice(symbol, price, priceLastTrade);
            return { price, quantity };
        }

        this.handlers.SHORT.SELL = async ({ symbol } = {}) => {
            let price = await this.instance.getLowestAsk(symbol);
            let quantity = await this.instance.getOrderQuantity(price);
            return { price, quantity };
        }
    }

    getHandler(state, side) {
        const handler = this.handlers[state][side];
        if (!handler) {
            throw new Error(`No handler found for state ${state} and side ${side}`);
        }
        return handler;
    }
}

module.exports = StateHandlers;