const { USERS } = require('./constants.js');
const Instance = require('./lib/Instance.js');

class App {
    
    constructor(user) {
        this.instance = new Instance(USERS[user.toUpper()]);
    }

    async init() {
        await this.instance.init();
    }


}

const app = new App(USERS["PHIL"]);
await app.init();
console.log('Ready!');