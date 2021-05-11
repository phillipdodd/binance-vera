import math, { BigNumber } from 'mathjs';
const defaultFixedValue = 8;

export default class Calc {
    static add(x: any, y: any, toFixedValue = defaultFixedValue) {
        try {
            [x, y] = this.convertToBigNumbers(x, y);
            let result = x.add(y).toFixed(toFixedValue).valueOf();
            return result;
        } catch (err) {
            throw err;
        }
    }

    static sub(x: any, y: any, toFixedValue = defaultFixedValue) {
        try {
            [x, y] = this.convertToBigNumbers(x, y);
            let result = x.sub(y).toFixed(toFixedValue).valueOf();
            return result;
        } catch (err) {
            throw err;
        }
    }

    static mul(x: any, y: any, toFixedValue = defaultFixedValue) {
        try {
            [x, y] = this.convertToBigNumbers(x, y);
            let result = x.mul(y).toFixed(toFixedValue).valueOf();
            return result;
        } catch (err) {
            throw err;
        }
    }

    static div(x: any, y: any, toFixedValue = defaultFixedValue) {
        try {
            [x, y] = this.convertToBigNumbers(x, y);
            let result = x.dividedBy(y).toFixed(toFixedValue).valueOf();
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

    static increaseByPercentage(decimal: any, percentage: any, toFixedValue = defaultFixedValue) {
        try {
            [decimal, percentage] = this.convertToBigNumbers(decimal, percentage);
            let result = decimal.mul(percentage).toFixed(toFixedValue).valueOf();
            return result;
        } catch (err) {
            throw err;
        }
    }

    static decreaseByPercentage(decimal: any, percentage: any, toFixedValue = defaultFixedValue) {
        try {
            [decimal, percentage] = this.convertToBigNumbers(decimal, percentage);
            let result = decimal.dividedBy(percentage).toFixed(toFixedValue).valueOf();
            return result;
        } catch (err) {
            throw err;
        }
    }

    static roundToTickSize(decimal: any, tickSize: any) {
        try {
            [decimal, tickSize] = this.convertToBigNumbers(decimal, tickSize);
            return decimal.sub(decimal.mod(tickSize)).valueOf();
        } catch (err) {
            throw err;
        }
    }

    static roundToStepSize(decimal: any, stepSize: any) {
        try {
            [decimal, stepSize] = this.convertToBigNumbers(decimal, stepSize);
            return decimal.toFixed(Math.abs(stepSize.e));
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

    static convertToBigNumbers(...args: any[]) {
        try {
            return [...args].map((value) => {
                return math.bignumber(value);
            });
        } catch (err) {
            throw err;
        }
    }
}