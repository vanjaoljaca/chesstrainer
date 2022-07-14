import _ from 'lodash';
import { Orientation } from './ChessTrainerShared';

export type Module = {
  name: string,
  source: 'remote' | 'local' | 'new'
  orientation: Orientation
}

async function getMoveRepositoryAsync() {
  let r = await fetch('/moverepository.txt', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  })
  return r.json();
}

async function getDataAsync(moduleName: string) {
  let r = await fetch('/' + moduleName + '.txt', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  })
  return r.json();
}


export class ModuleBrowser {

  static readonly ModuleBrowser_KEY = 'ModuleRoot';
  static readonly ModuleBrowser_PREFIX = 'ModuleRoot/';

  modules: string[] = [];

  loadLocalNames(): { white: [], black: [] } {
    let raw = localStorage.getItem(ModuleBrowser.ModuleBrowser_KEY)
    let loaded = raw ? JSON.parse(raw) : {
      white: [],
      black: []
    };
    if (loaded) {
      // upgrade version?
      if (loaded.white === undefined) {
        return { white: loaded, black: [] };
      }
    }
    return loaded;
  }

  loadLocal(): Module[] {
    let jsons = this.loadLocalNames();
    const source = 'local';
    return _.concat(
      jsons.white.map(name => ({ name, source, orientation: 'white' })),
      jsons.black.map(name => ({ name, source, orientation: 'black' })));
  }

  async loadRemoteAsync() {
    try {
      let json = await getMoveRepositoryAsync(); // todo

      return json.map(m => { return { name: m, source: 'remote', orientation: 'black' } });
    } catch (e) {
      console.log('failed to load remote', e);
      return [] as Module[];
    }
  }

  async loadAsync(x: Module) {
    if (x.source === 'local') {
      return this.loadLocalRespository(x.name);
    }
    return await this.loadRemoteRepositoryAsync(x.name);
  }

  loadLocalRespository(name: string) {
    let raw = localStorage.getItem(ModuleBrowser.ModuleBrowser_PREFIX + name)
    if (raw === null) {
      throw new Error('not found');
    }
    let jsons = JSON.parse(raw);
    return jsons;
  }

  saveLocalRepository(name: string, orientation: Orientation, json: string) {
    localStorage.setItem(ModuleBrowser.ModuleBrowser_PREFIX + name, json);
    let local = this.loadLocalNames();
    let collection = local[orientation] as string[];
    if (collection.indexOf(name) === -1) {
      collection.push(name);
      localStorage.setItem(ModuleBrowser.ModuleBrowser_KEY, JSON.stringify(local));
    }
  }

  async loadRemoteRepositoryAsync(name: string) {
    return getDataAsync(name);
  }
}