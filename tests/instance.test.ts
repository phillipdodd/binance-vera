import Instance from "../lib/Instance";
import { User } from '../constants';

const instance = new Instance(User.Phil);

describe('success', () => {
    it('can initialize an instance', async () => {
        const didInit = await instance.init();
        expect(didInit).toBe(true);
    });

    it('can close opened websocket', () => {
        instance.closeAllWebsockets();
        expect(instance.getWebsocketCloserCount()).toBe(0);
    });
});

// describe('fail', () => {

// });