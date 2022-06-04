import { useEffect, useState } from "react";
import React from 'react';
import './App.css';

import { ChessTrainer } from './ChessTrainer'
import { ChessTrainerView } from './ChessTrainerView'
import { ChessTrainerBuilder } from './ChessTrainerBuilder'
import { ChessTrainerBuilderView } from './ChessTrainerBuilderView'
import 'bootstrap/dist/css/bootstrap.min.css';
import { Repository } from "./Repository";
import { Orientation } from "./ChessTrainerShared";

async function getMoveRepositoryAsync() {
  let r = await fetch('/moverepository.json', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/pdf',
    },
  })
  return r.json();
}

function App() {
  let [playing, setPlaying] = useState(true);
  let [building, setBuilding] = useState(false)
  let [repository, setRepository] = useState<Repository>(null)
  let [trainerBuilder, setTrainerBuilder] = useState<ChessTrainerBuilder>(null)
  let [trainer, setTrainer] = useState<ChessTrainer>(null)

  async function loadRemoteJson() {
    let orientation: Orientation = 'black'
    let json = await getMoveRepositoryAsync();
    let repository = new Repository();
    repository.merge(json);
    // would be nice if this wasn't needed, but you know, crap happens!
    repository.mergeFromLocal();
    repository.dedupe();
    setRepository(repository);
    setTrainerBuilder(new ChessTrainerBuilder(repository, orientation))
    setTrainer(new ChessTrainer(repository, orientation))
  }

  useEffect(() => {
    loadRemoteJson()
  }, [])

  function onOutputRepo() {
    repository.dedupe();
    let json = repository.json();
    console.log(json)
    navigator.clipboard.writeText(json)
  }

  function onPlayWhite() {
    trainer.orientation = 'white'
    trainer.reset();
    setBuilding(false);
    setPlaying(true);
  }

  function onPlayBlack() {
    trainer.orientation = 'black'
    trainer.reset();
    setBuilding(false);
    setPlaying(true);
  }

  function onToggleEdit() {
    if(playing) {
      setTrainerBuilder(tb => {
        tb.currentBranch = trainer.currentBranch
        return tb
      })
    } else {
      trainer.currentBranch = trainerBuilder.currentBranch;
      setTrainer(t => {
        t.currentBranch = trainerBuilder.currentBranch
        return t
      })
    }
    setBuilding(b => !b)
    setPlaying(p => !p);
  }

  // if(!playing && !building) {
  //   return (
  //     <div>
  //       <button onClick={onPlayWhite}>play white</button>
  //       <button onClick={onPlayBlack}>play black</button>
  //       <button onClick={onEdit}>edit</button>
  //     </div>)
  // }

  if(!repository) {
    return <p>loading</p>
  }

  let coreView = building
    ? <ChessTrainerBuilderView trainer={trainerBuilder} />
    : <ChessTrainerView trainer={trainer} />

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
          <button onClick={onToggleEdit}>{building ? 'play' : 'edit'}</button>
          <button onClick={onOutputRepo}>output repo</button>
        </div>
        {coreView}    
      </header>
    </div>
  );
}

export default App;
