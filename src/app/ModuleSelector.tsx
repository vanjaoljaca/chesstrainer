import { useState } from "react";
import React from 'react';
import { Module, Submodule } from "./ModuleBrowser";

export function ModuleSelector({ modules, onSelected }: { modules: Module[]; onSelected: (module: Module) => void; }) {
    let [name, setName] = useState<string>('');

    function handleSelected(m) {
        onSelected(m);
    }

    return (
        <div>
            <p>Select a module</p>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                {modules.map(o =>
                    <button key={o.source + o.name} value={JSON.stringify(o)} onClick={() => handleSelected(o)}
                        style={{ width: '70vh' }}>
                        <p style={{ alignContent: 'left', textAlign: 'left', verticalAlign: 'center' }}>
                            {o.orientation === 'white' ? '⚪️' : '⚫️'} {o.source} {o.name}
                        </p>
                    </button>
                )}
            </div>
            <div>
                <label>name</label>
                <input type='text' onChange={e => setName(e.target.value)} value={name}></input>
                <button onClick={() => handleSelected({ source: 'new', name })}>New</button>
            </div>
        </div >);
}


export function SubmoduleSelector({ submodules, onSelected }: { submodules: Submodule[]; onSelected: (submodule: Submodule) => void; }) {
    let [name, setName] = useState<string>('');

    function handleSelected(m) {
        onSelected(m);
    }

    return (
        <div>
            <p>Select a submodule</p>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                {submodules.map(o =>
                    <button key={o.name} value={JSON.stringify(o)} onClick={() => handleSelected(o)}
                        style={{ width: '70vh' }}>
                        <p style={{ alignContent: 'left', textAlign: 'left', verticalAlign: 'center' }}>
                            ♔ {o.name}
                        </p>
                    </button>
                )}
            </div>
            <div>
                <label>name</label>
                <input type='text' onChange={e => setName(e.target.value)} value={name}></input>
                <button onClick={() => handleSelected({ source: 'new', name })}>New</button>
            </div>
        </div >);
}
