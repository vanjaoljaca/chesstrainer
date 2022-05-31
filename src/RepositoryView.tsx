import { useState } from "react"
import { MoveRepository, Branch, MoveBranch } from './ChessTrainerShared'
import TreeView from "./TreeView";

function BranchView({ branch, level, onSelected, selected }) {
    // if(level >= 3)
    //     return <p>...</p>;
    let [collapsed, setCollapsed] = useState(() => level >= 9999);

    function onClick(a) {
        setCollapsed(c => !c);
        onSelected && onSelected({branch, level})
    }

    function onChildSelected({branch, level}) {
        onSelected && onSelected({branch, level});
    }

    return (
        <div>
            {/* <input type='checkbox'>{branch.name} {branch.move.from} {branch.move.to}</input> */}
            <TreeView 
                nodeLabel={(
                    level + ' ' + branch.move.from + '->' + branch.move.to + ' ' + (branch == selected ? '*' : ' ')
                )}
                collapsed={collapsed}
                onClick={onClick}>
                {branch.branches.map((b, i) => {
                    return (
                        <div style={{marginLeft: 60}}>
                            <BranchView key={i} branch={b} level={level+1} onSelected={onChildSelected} selected={selected}/>
                        </div>
                    )
                })}
            </TreeView>
        </div>
    );
}

function findParentLevel(branch: MoveBranch, level: number) {
    var current = branch;
    if(current == null) return null;
    for(var i = 0; i < level; i++) {
        if(current.parent as MoveBranch == null)
            return current.parent;
        current = current.parent as MoveBranch;
    }
    return current;
}

export function RepositoryView({ repository, onSelected }) {
    let [selected, setSelected] = useState(null)
    let [level, setLevel] = useState(0);

    if(!repository)
        return <p>null repo</p>

    function onClick(x: any) {
        console.log('click', x)
    }

    function onChildSelected({branch, level}) {
        setSelected(branch);
        setLevel(level)
        onSelected && onSelected(branch);
    }

    let parentLevel = findParentLevel(selected, 3);

    let root = selected == null || parentLevel == null
        ? repository.branches
        : parentLevel.branches;

    

    return (
        
        <div style={{border: 'solid', textAlign: 'left'}}>
            <div>repository view</div>
            <p>root is repository: {root == repository.branches ? 'true' : 'false'}</p>
            <p>findParentLevel: {parentLevel != null && 'move' in parentLevel ? parentLevel.move.from : 'null'}</p>
            {root.map((b, i) => {
                return (
                    // <TreeView key={i} branch={b}
                    //     nodeLabel={b.move.from + '->' + b.move.to}
                    //     onClick={onClick}>
                            // <div style={{marginLeft: 60}}>
                                <BranchView branch={b} level={1} onSelected={onChildSelected} selected={selected}/>
                            // </div>
                    // </TreeView>
                );
            })}
        </div>
    );
}


function BranchView1({ branch }) {
    return (
        <div>
            <input type='checkbox'>{branch.name} {branch.move.from} {branch.move.to}</input>
            {branch.branches.map((b, i) => {
                return <BranchView1 key={i} branch={b} />
            })}
        </div>
    );
}

export function RepositoryView1({ repository }) {
    let [current, setCurrent] = useState(null)
    if(!repository)
        return <p>null repo</p>
    console.log(repository)
    return (
        
        <div>
            <TreeView>
                {/* <TreeItem nodeId='1' label='test'/> */}
            </TreeView>
            <div>repository view</div>
            {repository.branches.map((b, i) => {
                return <BranchView1 key={i} branch={b}/>
            })}
        </div>
    );
}