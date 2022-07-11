
export type Module = {
  name: string,
  source: 'remote' | 'local' | 'new'
}


async function getMoveRepositoryAsync() {
    let r = await fetch('/moverepository.json', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/pdf',
      },
    })
    return r.json();
  }
  
  async function getDataAsync(fileName: string) {
    let r = await fetch('/' + fileName, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/pdf',
      },
    })
    return r.json();
  }
  

export class ModuleBrowser {
    
    static readonly ModuleBrowser_KEY = 'ModuleRoot';
    static readonly ModuleBrowser_PREFIX = 'ModuleRoot/';

    modules: string[] = [];

    loadLocalNames(): string[] {
      return JSON.parse(localStorage.getItem(ModuleBrowser.ModuleBrowser_KEY)) || [];
    }

    loadLocal(): Module[] {
        let jsons = this.loadLocalNames();
        return jsons.map(m => { return { name: m, source: 'local' } });
    }

    async loadRemoteAsync() {
        let json = await getMoveRepositoryAsync();
        
        return json.map(m => { return { name: m, source: 'remote' } });
    }

    async loadAsync(x) {
        if(x.source === 'local') {
            return this.loadLocalRespository(x.name);
        }
        return await this.loadRemoteRepositoryAsync(x.name);
    }

    loadLocalRespository(name: string) {
        let jsons = JSON.parse(localStorage.getItem(ModuleBrowser.ModuleBrowser_PREFIX + name));
        return jsons;
    }

      saveLocalRepository(name: string, json: string) {
        localStorage.setItem(ModuleBrowser.ModuleBrowser_PREFIX + name, json);
        let local = this.loadLocalNames();
        if(local.indexOf(name) === -1)
            local.push(name);
        localStorage.setItem(ModuleBrowser.ModuleBrowser_KEY, JSON.stringify(local));
    }

    async loadRemoteRepositoryAsync(name: string) {
        return getDataAsync(name);
    }
}