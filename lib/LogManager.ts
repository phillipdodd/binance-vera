import WinstonLogger from "./WinstonLogger";

class LogManager {

    public logger = WinstonLogger;
    static instance: LogManager;

    constructor() {}

    public static getLogger() {
        if (this.instance === undefined) {
            this.instance = new LogManager();
        }
        return this.instance.logger;
    }
}

export default LogManager;