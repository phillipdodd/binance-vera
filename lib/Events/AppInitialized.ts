import Event from "./Event";

class AppInitialized implements Event {
    public readonly name: string = "AppInitialized"
    public readonly args: any = null;

    constructor() {}
}

export default AppInitialized;