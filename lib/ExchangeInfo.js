class ExchangeInfo {
    constructor(client) {
        this.client = client;
        this.data = {};
    }

    async init() {
        this.data = await this.getSimplifiedExchangeInfo(this.client);
    }

    async getSimplifiedExchangeInfo() {
        let exchangeInfo = await this.client.exchangeInfo();

        let simplifiedExchangeInfo = {};
        
        exchangeInfo.symbols.forEach((value) => {
            simplifiedExchangeInfo[value.symbol] = simplifyExchangeInfo(value);
        });
        return simplifiedExchangeInfo;
    }

    isValidSymbol(symbol) {
        return !!this.data[symbol];
    }

    getTickSize(symbol) {
        if (!this.isValidSymbol(symbol)) {
            throw new Error(`Input error: ${symbol} is an invalid symbol`);
        }
        return this.data[symbol].tickSize;
    }

    getStepSize(symbol) {
        if (!this.isValidSymbol(symbol)) {
            throw new Error(`Input error: ${symbol} is an invalid symbol`);
        }
        return this.data[symbol].stepSize;
    }
}

function simplifyExchangeInfo(value) {
    return {
        baseAsset: value.baseAsset,
        quoteAsset: value.quoteAsset,
        quotePrecision: value.quotePrecision,
        status: value.status,
        tickSize: getFilterValue(value, "tickSize"),
        stepSize: getFilterValue(value, "stepSize"),
        minNotional: getFilterValue(value, "minNotional"),
    };
}

function getFilterValue(value, filterName) {
    return value.filters.find((filter) => {
        return filter.hasOwnProperty(filterName);
    })[filterName];
}

module.exports = ExchangeInfo;