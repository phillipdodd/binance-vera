# Auto Binance Trading

# Potential Packages

-   [Tulind](https://www.npmjs.com/package/tulind)
    -   Tulip Node is the official node.js wrapper for [Tulip Indicators](https://tulipindicators.org/). It provides 100+ technical analysis indicator functions, such as: simple moving average, Bollinger Bands, MACD, Parabolic SAR, Stochastic Oscillator, and many more.
-   [nedb-models](https://www.npmjs.com/package/nedb-models) or [nedb-promises](https://www.npmjs.com/package/nedb-promises)
    -   flat file db

# Flow (outdated?)

- App.init
    - Instance.init
        - await SimplifiedExchangeInfo.init
        - await WebSocketManager.startUserWebsocket
            - if eventData.orderStatus === 'FILLED'
                - Event: _OrderFilled_
        - Event: _AppInitialized_

- On _AppInitialized_
    - OrderHandler.handleAppInitialized
        - OrderHandler.initOrder on each symbol in USER_CONFIG[<user>].INIT_SYMBOLS
            - OrderHandler.placeOrder using OrderStrategy.getInitialOrderOptions
                - Event: _OrderPlaced_

- On _OrderPlaced_
    - TimerManager.onOrderPlaced
        - TimerManager.createResetTimer
            - Event: _OrderShouldCancel_
        - Timer.createChangeStrategyTimer
            - Event: _StrategyShouldChange_

- On _OrderFilled_
    - TimerManager.onOrderFilled
        - TimerManager.deleteTimer
    - OrderHandler.onOrderFilled
        - OrderHandler.relistOrder
            - OrderHandler.placeOrder using OrderHandler.getRelistOrderOptions
            - Event: _OrderPlaced_  

- On _OrderShouldCancel_
    - OrderHandler.onOrderShouldCancel
        - OrderHandler.cancelOrder
            - Event: _OrderCancelled_

- On _StrategyShouldChange_
    - OrderHandler.onStrategyShouldChange
        - Event: _StrategyDidChange_

- On _OrderCancelled_
    - TimerHandler.deleteTimer        
