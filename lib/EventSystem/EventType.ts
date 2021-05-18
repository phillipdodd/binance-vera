type EventType =
    "AppInitialized" |
    "OrderPlaced" | // needs to pass along the used strategy as well
    "OrderFilled" |
    "StrategyShouldChange" |
    "StrategyDidChange" |
    "OrderShouldCancel" |
    "OrderCancelled"
    ;

export default EventType;