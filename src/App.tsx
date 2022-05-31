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
  let [loaded, setLoaded] = useState(false)
  let [building, setBuilding] = useState(false)
  let [repository, setRepository] = useState(null)
  let [trainerBuilder, setTrainerBuilder] = useState(null)
  let [trainer, setTrainer] = useState(null)

  async function loadRemoteJson() {
    console.log('making')
    let orientation: Orientation = 'black'
    let json = await getMoveRepositoryAsync();
    let repository = new Repository();
    repository.mergeFromJson(json);
    setRepository(repository);
    setTrainerBuilder(new ChessTrainerBuilder(repository, orientation))
    setTrainer(new ChessTrainer(repository, orientation))
    setLoaded(true);
    console.log('made')
  }

  useEffect(() => {
    loadRemoteJson()
  }, [])

  function onOutputRepo() {
    console.log(trainerBuilder.getRepositoryJson())
  }

  if(!loaded) {
    return <p>loading...</p>
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
      <link rel="stylesheet" type="text/css" href="react-treeview.css"></link>
      <header className="App-header">
        <button onClick={() => setBuilding(b => !b)}>{building ? 'building' : 'playing'}</button>
        <button onClick={onOutputRepo}>output repo</button>
        {coreView}
      </header>
    </div>
  );
}

export default App;
