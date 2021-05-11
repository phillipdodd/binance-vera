import Instance from "./lib/Instance";
import { User } from "./constants";

class App {
    
    instance: Instance;

    constructor(user: User) {
        this.instance = new Instance(user);
    }

    async init() {
        await this.instance.init();
        console.log('App initialized');
    }


}

const app = new App(User.Phil);
app.init();
