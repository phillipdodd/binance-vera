import EventListener from "./EventSystem/EventListener";
import EventManager from "./EventSystem/EventManager";
import Instance from "./Instance";
import WinstonLogger from "./WinstonLogger";

class LogManager {
    public logger = WinstonLogger;
    private instance: Instance;

    constructor(instance: Instance) {
        this.instance = instance;
    }
}

export default LogManager;