const states = {
    bid: "bid",
    ask: "ask"
}

// BUY/SELL handler per state
const handlers = {
    bid: {
        "BUY": (e) => {
            // place ASK for INCREASED price
            // start STATE SWAP timer

            const order = placeOrder()
            orderStateDict[order.orderId] = currentState;
            // NOTE: deletes record of order triggering this one, not the new order
            delete orderStateDict[e.orderId]
        },
        "SELL": (e) => {
            // place BID at HIGHEST BID price
            // start RELIST timer

            const order = placeOrder()
            orderStateDict[order.orderId] = currentState;
            // NOTE: deletes record of order triggering this one, not the new order
            delete orderStateDict[e.orderId]
        }
    },
    ask: {
        "BUY": (e) => {
            // place ASK at LOWEST ASK
            // start RELIST timer
            const order = placeOrder()
            orderStateDict[order.orderId] = currentState;
            // NOTE: deletes record of order triggering this one, not the new order
            delete orderStateDict[e.orderId]
        },
        "SELL": (e) => {
            // place BID for DECREASED price
            // start STATE SWAP timer

            const order = placeOrder()
            orderStateDict[order.orderId] = currentState;
            // NOTE: deletes record of order triggering this one, not the new order
            delete orderStateDict[e.orderId]
        }
    }
}

function relistOrder(orderId) {
    await cancelOrder(orderId);
    const prices = await getGapPrices();
    // place order using prices[side]
    const order = clientPlaceOrder();
    relistTimer(orderId);
}

async function getGapPrices() {
    return {
        "BUY": highestBid,
        "ASK": lowestAsk
    }
}

// in which state was order placed
// used to determine handler selection
const orderStateDict = {
    orderId: state
}

let currentState = states.bid

async function placeOrder(symbol, side) {
    const order = await clientPlaceOrder();
    return order;
}

function switchState() {
    if (currentState == states.bid) {
        currentState = states.ask;
    } else {
        currentState = states.bid;
    }
}

function handleFilledExecutionReport(e) {
    const stateOrderPlacedIn = orderStateDict[e.orderId];
    const handler = handlers[stateOrderPlacedIn][e.side];
    handler(e);
}


function stateSwapTimer(orderId) {
    setTimeout(() => {
        if (!isOrderFilled(orderId)) {
            switchState();
        }
    }, config.stateSwapTimerTime);
}

function relistTimer(orderId) {
    setTimeout(() => {
        if (!isOrderFilled(orderId)) {
            relistOrder(orderId);
        }
    }, config.relistTimerTime);
}

async function isOrderFilled(orderId) {
    const {
        status
    } = await getOrder(orderId);
    return status === "FILLED";
}