import { ModuleBrowser } from '../../app/ModuleBrowser';
import fs from 'fs';

let sut = new ModuleBrowser();

beforeEach(() => {
    global.fetch = fetchLocal
    localStorage.clear();
});

test('old version', () => {
    localStorage.setItem(ModuleBrowser.ModuleBrowser_KEY, JSON.stringify(['caro-kann']));
    let r = sut.loadLocalNames(); //?
    expect(r).toEqual({ white: ['caro-kann'], black: [] });
})

test('it is so good', () => {

    sut.saveLocalRepository('test', 'black', '{ branches: []}')
    sut.saveLocalRepository('wtest', 'white', '{ branches: []}')
    let localNames = sut.loadLocalNames();
    let locals = sut.loadLocal();

    expect(localNames).toEqual({ black: ['test'], white: ['wtest'] });
    expect(locals).toEqual([
        { name: 'wtest', source: 'local', orientation: 'white ' },
        { name: 'test', source: 'local', orientation: 'black ' }]);
});

test('it ok', async () => {

    let r = await sut.loadRemoteAsync();
    expect(r).toEqual([{ name: 'caro-kann', source: 'remote' }]);
})

test('it load remoteo', async () => {
    let r = await sut.loadAsync({ name: 'caro-kann', source: 'remote', orientation: 'black' });
    expect(r).toBeDefined()
    expect(r.branches).toBeDefined()
})

test('it load local', async () => {
    sut.saveLocalRepository('test', 'black', JSON.stringify({ branches: [] }))
    let r = await sut.loadAsync({ name: 'test', orientation: 'black', source: 'local' });
    expect(r).toBeDefined()
    expect(r.branches).toBeDefined()
})

test('it aids', async () => {
    global.fetch = fetchFail

    let r = await sut.loadRemoteAsync();
    expect(r).toEqual([]);
})

let fetchLocal = async (path) => {
    let r = fs.readFileSync('./public/' + path as string, 'utf8')
    return Promise.resolve(
        {
            json: () => Promise.resolve(JSON.parse(r))
        } as Response)
}

let fetchFail = async () => {
    return Promise.reject(new Error('failed to fetch'))
}