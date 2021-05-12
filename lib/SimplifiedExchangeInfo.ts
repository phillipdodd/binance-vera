import { Binance, ExchangeInfo, Symbol } from "us-binance-api-node";

interface SimplifiedSymbol {
    "baseAsset": string;
    "quoteAsset": string;
    "quotePrecision": number;
    "status": string;
    "tickSize": string;
    "stepSize": string;
    "minNotional": string;
}

export default class SimplifiedExchangeInfo {
    
    private client: Binance;
    private simplifiedExchangeInfo!: Map<string, SimplifiedSymbol>;
    
    constructor(client: Binance) {
        this.client = client;
    }

    async init() {
        this.simplifiedExchangeInfo = await this.getSimplifiedExchangeInfo();
    }

    async getSimplifiedExchangeInfo(): Promise<Map<string, SimplifiedSymbol>> {
        let exchangeInfo: ExchangeInfo = await this.client.exchangeInfo();
        let simplifiedExchangeInfo = new Map<string, SimplifiedSymbol>();
        
        exchangeInfo.symbols.forEach((symbol: Symbol) => {
            simplifiedExchangeInfo.set(symbol.symbol, simplifyExchangeInfo(symbol));
        });

        return simplifiedExchangeInfo;
    }

    isValidSymbol(symbol: string): boolean {
        return this.simplifiedExchangeInfo.has(symbol);
    }

    getTickSize(symbol: string) {
        if (!this.isValidSymbol(symbol)) {
            throw new Error(`Input error: ${symbol} is an invalid symbol`);
        }
        return this.simplifiedExchangeInfo.get(symbol)?.tickSize;
    }

    getStepSize(symbol: string) {
        if (!this.isValidSymbol(symbol)) {
            throw new Error(`Input error: ${symbol} is an invalid symbol`);
        }
        return this.simplifiedExchangeInfo.get(symbol)?.stepSize;
    }
}

function simplifyExchangeInfo(symbol: Symbol) {
    return {
        baseAsset: symbol.baseAsset,
        quoteAsset: symbol.quoteAsset,
        quotePrecision: symbol.quotePrecision,
        status: symbol.status,
        tickSize: getFilterValue(symbol, "tickSize"),
        stepSize: getFilterValue(symbol, "stepSize"),
        minNotional: getFilterValue(symbol, "minNotional"),
    };
}

function getFilterValue(symbol: Symbol, filterName: string): string {
    let value = "";
    const filter = symbol.filters.find(symbolFilter => {
        return symbolFilter.hasOwnProperty(filterName);
    });
    value = (filter as any)[filterName];
    return value;
}