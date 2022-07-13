import { ModuleBrowser } from '../../app/ModuleBrowser';
import fs from 'fs';

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

global.fetch = fetchLocal

let sut = new ModuleBrowser();

localStorage.clear();

test('it is so good', () => {

    sut.saveLocalRepository('test', '{ branches: []}')
    let localNames = sut.loadLocalNames();
    let locals = sut.loadLocal();

    expect(localNames).toEqual(['test']);
    expect(locals).toEqual([{ name: 'test', source: 'local' }]);
});

test('it ok', async () => {

    let r = await sut.loadRemoteAsync();
    expect(r).toEqual([{ name: 'caro-kann', source: 'remote' }]);
})

test('it load remoteo', async () => {
    let r = await sut.loadAsync({ name: 'caro-kann', source: 'remote' });
    expect(r).toBeDefined()
    expect(r.branches).toBeDefined()
})

test('it load local', async () => {
    sut.saveLocalRepository('test', JSON.stringify({ branches: [] }))
    let r = await sut.loadAsync({ name: 'test', source: 'local' });
    expect(r).toBeDefined()
    expect(r.branches).toBeDefined()
})

test('it aids', async () => {
    global.fetch = fetchFail

    let r = await sut.loadRemoteAsync();
    expect(r).toEqual([]);
})
