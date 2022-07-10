import { useCallback, useEffect, useState } from "react";
import React from 'react';
import './App.css';

import { ChessTrainer } from './ChessTrainer'
import { ChessTrainerView } from './ChessTrainerView'
import { ChessTrainerBuilder } from './ChessTrainerBuilder'
import { ChessTrainerBuilderView } from './ChessTrainerBuilderView'
import 'bootstrap/dist/css/bootstrap.min.css';
import { Repository } from "./Repository";
import { Orientation } from "./ChessTrainerShared";
import { ModuleBrowser } from "./ModuleBrowser";
import { json } from "stream/consumers";

function ModuleSelector({options, onSelected}) {
  let [name, setName] = useState<string>('')
  let [option, setOption] = useState(options[0]);

  function handleSelected(v) {
    onSelected(v);
  }

  return <div>
    <p>Select a module</p>

    <select onChange={o => setOption(JSON.parse(o.target.value))}>
      {options.map(o => 
        <option key={o.source + o.name} value={JSON.stringify(o)}>{o.source} {o.name}</option>
      )}
    </select>

    <button onClick={() => handleSelected(option)}>Load</button>
    <label>name</label>
    <input type='text' onChange={e => setName(e.target.value)} value={name}></input>
    <button onClick={() => handleSelected({source:'new', name})}>New</button>
  </div>
}

function App() {
  let [playing, setPlaying] = useState(true);
  let [building, setBuilding] = useState(false)
  let [repository, setRepository] = useState<Repository>(null)
  let [trainerBuilder, setTrainerBuilder] = useState<ChessTrainerBuilder>(null)
  let [trainer, setTrainer] = useState<ChessTrainer>(null)
  let [moduleManager, _] = useState<ModuleBrowser>(() => new ModuleBrowser())
  let [modules, setModules] = useState<[]>([]);
  let [module, setModule] = useState<any>(null)

  async function initializeJson() {
    let remoteModules = await moduleManager.loadRemoteAsync();
    let localModules = moduleManager.loadLocal();
    let allModules = remoteModules.concat(localModules);
    setModules(allModules);
    console.log('modules loaded', allModules)
  }

  async function loadRemoteJson(module) {
    console.log('loading remote json', module, JSON.stringify(module))
    let orientation: Orientation = 'black'
    let repository = new Repository();

    if(module.source === 'new') {
      
    } else {
      let json = await moduleManager.loadAsync(module);
      console.log('loading', module, json)
      repository.merge(json);
      // would be nice if this wasn't needed, but you know, crap happens!
      repository.mergeFromLocal();
      repository.dedupe();
    }
    setModule(module);
    setRepository(repository);
    setTrainerBuilder(new ChessTrainerBuilder(repository, orientation))
    setTrainer(new ChessTrainer(repository, orientation))
  }

  function onSaveModule() {
    moduleManager.saveLocalRepository(module.name, repository.json());
  }

  function onModuleSelected(module: any) {
    loadRemoteJson(module);
  }

  function onLoadModule() {
    initializeJson();
    setModule(null);
    setRepository(null)
  }

  useEffect(() => {
    initializeJson()
  }, [])

  function onOutputRepo() {
    repository.dedupe();
    let json = repository.json();
    console.log(json)
    navigator.clipboard.writeText(json)
  }

  function onToggleEdit() {
    if(playing) {
      setTrainerBuilder(tb => {
        tb.currentBranch = trainer.currentBranch
        tb.orientation = trainer.orientation
        return tb
      })
    } else {
      trainer.currentBranch = trainerBuilder.currentBranch;
      setTrainer(t => {
        t.currentBranch = trainerBuilder.currentBranch
        t.orientation = trainerBuilder.orientation
        return t
      })
    }
    setBuilding(b => !b)
    setPlaying(p => !p);
  }

  var coreView;
  if(!repository) {
    coreView = <ModuleSelector options={modules} onSelected={(m) => onModuleSelected(m)} />
  } else {
    coreView = building
      ? <ChessTrainerBuilderView trainer={trainerBuilder} />
      : <ChessTrainerView trainer={trainer} />
  }

  return (
    <div className="App">
      <link
        rel="stylesheet"
        href="https://maxcdn.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css"
        integrity="sha384-ggOyR0iXCbMQv3Xipma34MD+dH/1fQ784/j6cY/iJTQUOhcWr7x9JvoRxT2MZw1T"
        crossOrigin="anonymous"
      />
      {/* <link rel="stylesheet" type="text/css" href="react-treeview.css"></link> */}
      <header className="App-header">
        <div style={{textAlign:'left'}}>
          <button onClick={onLoadModule}>load module</button>
          <button onClick={onToggleEdit}>{building ? 'play' : 'edit'}</button>
          <button onClick={onOutputRepo}>output repo</button>
          <button onClick={onSaveModule}>save module</button>
          {module && <div>{module.name}</div>}
        </div>
        {coreView}    
      </header>
    </div>
  );
}

export default App;
