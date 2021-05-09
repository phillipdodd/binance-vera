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
        this.handlers.LONG.BUY = ({ symbol } = {}) => {
            const price = await this.instance.getHighestBid(symbol);
            const quantity = await this.instance.getOrderQuantity(price);
            return { price, quantity };
        }

        this.handlers.LONG.SELL = ({ symbol, price, priceLastTrade, quantity } = {}) => {
            const flipPrice = await this.instance.getFlipToAskPrice({ symbol, price, priceLastTrade });
            return { price: flipPrice, quantity };
        }

        this.handlers.SHORT.BUY = ({ symbol, price, priceLastTrade, quantity } = {}) => {
            const flipPrice = await this.instance.getFlipToBidPrice({ symbol, price, priceLastTrade });
            return { price: flipPrice, quantity }
        }

        this.handlers.SHORT.SELL = ({ symbol } = {}) => {
            const price = await this.instance.getLowestAsk(symbol);
            const quantity = await this.instance.getOrderQuantity(price);
            return { price, quantity };
        }
    }

    getHandler(side) {
        const handler = this.handlers[this.instance.state][side];
        if (!handler) {
            throw new Error(`No handler found for state ${state} and side ${side}`);
        }
        return handler;
    }
}

module.exports = StateHandlers;