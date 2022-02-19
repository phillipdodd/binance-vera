import { OutboundAccountInfo } from "us-binance-api-node";
import Event from "./Event";

type AccountBalanceUpdateArgs = {
    outboundAccountInfo: OutboundAccountInfo
}

class AccountBalanceUpdate implements Event {
    public readonly name: string = "OutboundAccountInfo"
    public readonly args: AccountBalanceUpdateArgs;

    constructor(outboundAccountInfo: OutboundAccountInfo) {
        this.args = { outboundAccountInfo };
    }
}

export default AccountBalanceUpdate;