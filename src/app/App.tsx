import { useEffect, useState } from "react";
import React from 'react';
import './App.css';

import { ChessTrainer } from './ChessTrainer'
import { ChessTrainerView } from './ChessTrainerView'
import { ChessTrainerBuilder } from './ChessTrainerBuilder'
import { ChessTrainerBuilderView } from './ChessTrainerBuilderView'
import 'bootstrap/dist/css/bootstrap.min.css';
import { Repository } from "./Repository";
import { Orientation, Persistable, RootBranch } from "./ChessTrainerShared";
import { ModuleBrowser, Module } from "./ModuleBrowser";
import { Container, Nav, Navbar, NavDropdown } from "react-bootstrap";
import { ModuleSelector } from "./ModuleSelector";

function App() {
  let [playing, setPlaying] = useState(true);
  let [building, setBuilding] = useState(false)
  let [repository, setRepository] = useState<Repository | null>(null)
  let [trainerBuilder, setTrainerBuilder] = useState<ChessTrainerBuilder | null>(null)
  let [trainer, setTrainer] = useState<ChessTrainer | null>(null)
  let [moduleManager, _] = useState<ModuleBrowser>(() => new ModuleBrowser())
  let [modules, setModules] = useState<Module[]>([]);
  let [module, setModule] = useState<Module | null>(null)

  async function initializeJson() {
    let remoteModules: Module[];
    try {
      remoteModules = await moduleManager.loadRemoteAsync();
    } catch (e) {
      console.log('failed to load remote', e);
      remoteModules = [];
    }
    let localModules = moduleManager.loadLocal();
    let allModules = remoteModules.concat(localModules);
    setModules(allModules);
  }

  async function loadModuleAsync(module: Module) {
    let orientation: Orientation = 'white'
    let repository = new Repository();

    if (module.source === 'new') {

    } else {
      let persisted = await moduleManager.loadAsync(module);
      repository.unpersist(persisted);
      // would be nice if this wasn't needed, but you know, crap happens!
      repository.dedupe();
    }
    setModule(module);
    setRepository(repository);
    setTrainerBuilder(new ChessTrainerBuilder(repository, orientation))
    setTrainer(new ChessTrainer(repository, orientation))
  }

  function onSaveModule() {
    if (!trainer || !module || !repository)
      throw new Error('not ready')

    let json = JSON.stringify(repository.persistable());
    moduleManager.saveLocalRepository(module.name, trainer.orientation, json);
  }

  function onModuleSelected(module: Module) {
    loadModuleAsync(module);
  }

  function onLoadModule() {
    initializeJson();
    setModule(null);
    setRepository(null)
  }

  useEffect(() => {
    initializeJson()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function onOutputRepo() {
    if (!repository) throw new Error('no repository')
    let json = JSON.stringify(repository.persistable());
    navigator.clipboard.writeText(json)
  }

  function onToggleEdit() {
    if (!trainer) throw new Error('no trainer')
    if (!trainerBuilder) throw new Error('no trainer builder')

    if (playing) {
      setTrainerBuilder(tb => {
        if (!trainer) throw new Error('no trainer')
        if (!tb) throw new Error('no trainer builder')
        tb.currentBranch = trainer.currentBranch
        tb.orientation = trainer.orientation
        return tb
      })
    } else {
      trainer.currentBranch = trainerBuilder.currentBranch;
      setTrainer(t => {
        if (!t) throw new Error('no trainer')
        if (!trainerBuilder) throw new Error('no trainer builder')
        t.currentBranch = trainerBuilder.currentBranch
        t.orientation = trainerBuilder.orientation
        return t
      })
    }
    setBuilding(b => !b)
    setPlaying(p => !p);
  }

  function Menu({ contextual }) {
    return (
      <Navbar bg="light" expand="lg" style={{ color: '#282c34' }} variant='light'>
        <Container>
          <Navbar.Brand>♟ {module === null ? 'Chess Trainer' : module.name}</Navbar.Brand>
          <Nav.Item onClick={onToggleEdit}>{building ? 'Play' : 'Edit'}</Nav.Item>
          {/* <NavDropdown title="Link" id="navbarScrollingDropdown">
            <NavDropdown.Item href="#action3">Action</NavDropdown.Item>
            <NavDropdown.Item href="#action4">Another action</NavDropdown.Item>
            <NavDropdown.Divider />
            <NavDropdown.Item href="#action5">
              Something else here
            </NavDropdown.Item>
          </NavDropdown> */}
          <NavDropdown title="↕️🧵" id="navbarScrollingDropdown">
            <NavDropdown.Item onClick={onLoadModule}>Load Module</NavDropdown.Item>
            <NavDropdown.Item onClick={onSaveModule}>Save Module</NavDropdown.Item>
            <NavDropdown.Item onClick={onOutputRepo}>Export</NavDropdown.Item>
          </NavDropdown>
          {/* <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
              <Nav.Item onClick={onLoadModule}>Load Module</Nav.Item>
              <Nav.Item onClick={onSaveModule}>Save Module</Nav.Item>
              <Nav.Item onClick={onOutputRepo}>Export</Nav.Item>
              {contextual}
            </Nav>
          </Navbar.Collapse> */}
        </Container>
      </Navbar>
    )
  }

  function ViewContent() {

    if (module == null) {
      return (
        <div className="App-content">
          <div>
            <h3>♟ Chess Trainer</h3>
            <ModuleSelector modules={modules} onSelected={onModuleSelected} />
          </div>
        </div>)
    }

    if (!trainerBuilder || !trainer) throw new Error('trainerBuilder or trainer missing')

    return (
      <div>
        <Menu contextual={null} />
        <p />
        <div className="App-content">
          {building
            ? <ChessTrainerBuilderView trainer={trainerBuilder} />
            : <ChessTrainerView trainer={trainer} />}
        </div>
      </div>
    )
  }

  return (
    <div className="App">
      <link
        rel="stylesheet"
        href="https://maxcdn.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css"
        integrity="sha384-ggOyR0iXCbMQv3Xipma34MD+dH/1fQ784/j6cY/iJTQUOhcWr7x9JvoRxT2MZw1T"
        crossOrigin="anonymous"
      />
      <ViewContent />
    </div>
  );
}

export default App;
