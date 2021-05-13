import Instance from "./lib/Instance";
import { User } from "./constants";

class App {
    
    instance: Instance;

    constructor(user: User) {
        this.instance = new Instance(user);
    }

    async init() {
        await this.instance.init();
    }
}

const app = new App(User.Phil);
(async () => {
    await app.init();
    app.instance.closeAllWebsockets();
})()
