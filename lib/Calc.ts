import math, { BigNumber } from 'mathjs';
import { CONFIG } from "../constants";
export default class Calc {
    static add(x: any, y: any, toFixedValue = CONFIG.DEFAULT_TO_FIXED) {
        try {
            [x, y] = this.convertToBigNumbers(x, y);
            let result = (x as BigNumber).add(y).toFixed(toFixedValue).valueOf();
            return result;
        } catch (err) {
            throw err;
        }
    }

    static sub(x: any, y: any, toFixedValue = CONFIG.DEFAULT_TO_FIXED) {
        try {
            [x, y] = this.convertToBigNumbers(x, y);
            let result = (x as BigNumber).sub(y).toFixed(toFixedValue).valueOf();
            return result;
        } catch (err) {
            throw err;
        }
    }

    static mul(x: any, y: any, toFixedValue = CONFIG.DEFAULT_TO_FIXED) {
        try {
            [x, y] = this.convertToBigNumbers(x, y);
            let result = (x as BigNumber).mul(y).toFixed(toFixedValue).valueOf();
            return result;
        } catch (err) {
            throw err;
        }
    }

    static div(x: any, y: any, toFixedValue = CONFIG.DEFAULT_TO_FIXED) {
        try {
            [x, y] = this.convertToBigNumbers(x, y);
            let result = (x as BigNumber).dividedBy(y).toFixed(toFixedValue).valueOf();
            return result;
        } catch (err) {
            throw err;
        }
    }
    
    static sum(...decimals: any[]) {
        try {
            return this.convertToBigNumbers(...decimals)
                .reduce((previous, current) => {
                    return previous.add(current);
                })
                .toFixed(8)
                .valueOf();
        } catch (err) {
            throw err;
        }
    }

    static getAbsDiff(x: any, y: any, toFixedValue = defaultFixedValue) {
        try {
            return math.abs(this.sub(x, y));
        } catch (err) {
            throw err;
        }
    }

    static increaseByPercentage(decimal: any, percentage: any, toFixedValue = CONFIG.DEFAULT_TO_FIXED) {
        try {
            [decimal, percentage] = this.convertToBigNumbers(decimal, percentage);
            let result = (decimal as BigNumber).mul(percentage).toFixed(toFixedValue).valueOf();
            return result;
        } catch (err) {
            throw err;
        }
    }

    static decreaseByPercentage(decimal: any, percentage: any, toFixedValue = CONFIG.DEFAULT_TO_FIXED) {
        try {
            [decimal, percentage] = this.convertToBigNumbers(decimal, percentage);
            let result = (decimal as BigNumber).dividedBy(percentage).toFixed(toFixedValue).valueOf();
            return result;
        } catch (err) {
            throw err;
        }
    }

    static roundToTickSize(decimal: any, tickSize: any) {
        try {
            [decimal, tickSize] = this.convertToBigNumbers(decimal, tickSize);
            return (decimal as BigNumber).sub(decimal.mod(tickSize)).valueOf();
        } catch (err) {
            throw err;
        }
    }

    static roundToStepSize(decimal: any, stepSize: any) {
        try {
            [decimal, stepSize] = this.convertToBigNumbers(decimal, stepSize);
            return (decimal as BigNumber).toFixed(Math.abs(stepSize.e));
        } catch (err) {
            throw err;
        }
    }

    static lessThanOrEqualTo(x: any, y: any) {
        try {
            [x, y] = this.convertToBigNumbers(x, y);
            return x.lessThanOrEqualTo(y);
        } catch (err) {
            throw err;
        }
    }

    static convertToBigNumbers(...args: any) {
        try {
            return [...args].map((value) => {
                return math.bignumber(value);
            });
        } catch (err) {
            throw err;
        }
    }
}