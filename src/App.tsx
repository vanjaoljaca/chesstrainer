import { useState } from "react";
import React from 'react';
import './App.css';

import { ChessTrainer } from './ChessTrainer'
import { ChessTrainerView } from './ChessTrainerView'
import { ChessTrainerBuilder } from './ChessTrainerBuilder'
import { ChessTrainerBuilderView } from './ChessTrainerBuilderView'
import 'bootstrap/dist/css/bootstrap.min.css';

let repository = null;
let trainerBuilder = new ChessTrainerBuilder(null, 'black')
let trainer = new ChessTrainer(null, 'black')

async function getMoveRepositoryAsync() {
  let r = await fetch('/moverepository.json', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/pdf',
    },
  })
  return r.json();
}

async function loadMoveRepositoryAsync() {
  let json = await getMoveRepositoryAsync();
  console.log('got json', json)
  trainerBuilder.mergeFromJson(json);
  trainerBuilder.persistRepository();
  trainer.repository = trainer.loadRepository();
}

loadMoveRepositoryAsync();

function onOutputRepo() {
  console.log(trainerBuilder.getRepositoryJson())
}

function App() {
  let [building, setBuilding] = useState(false)

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
