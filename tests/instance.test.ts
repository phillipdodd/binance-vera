import Instance from "../lib/Instance";
import { User } from '../constants';

const instance = new Instance(User.Phil);

afterAll(() => {
    instance.closeAllWebsockets();
});

describe('success', () => {
    it('can initialize an instance', async () => {
        const didInit = await instance.init();
        expect(didInit).toBe(true);
    });
});

// describe('fail', () => {

// });