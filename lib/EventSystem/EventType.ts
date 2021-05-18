type EventType =
    "AppInitialized" |
    "OrderPlaced" |             //? wants: side, orderId, needs to pass along the used strategy as well
    "OrderFilled" |             //? wants: orderId
    "StrategyShouldChange" | 
    "StrategyDidChange" |
    "OrderShouldCancel" |       //? data = orderId: string
    "OrderCancelled"
    ;

export default EventType;