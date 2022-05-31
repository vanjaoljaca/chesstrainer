import { useState } from "react"
import { Branch, MoveBranch } from './ChessTrainerShared'
import { Repository } from "./Repository";
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
                    level + ' ' + branch.move.from + '->' + branch.move.to + ' ' + (branch === selected ? '*' : ' ')
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

type RepositoryViewProps = {
    repository: Repository, 
    onSelected: (branch: Branch) => void
}

export function RepositoryView({ repository, onSelected }: RepositoryViewProps) {
    let [selected, setSelected] = useState(null)
    // let [level, setLevel] = useState(0);

    if(!repository)
        return <p>null repo</p>

    function onChildSelected({branch, level}) {
        setSelected(branch);
        // setLevel(level)
        onSelected && onSelected(branch);
    }

    let parentLevel = findParentLevel(selected, 3);

    let root = selected == null || parentLevel == null
        ? repository.root.branches
        : parentLevel.branches;
    
    return (
        <div style={{border: 'solid', textAlign: 'left'}}>
            <div>repository view</div>
            <p>root is repository: {root === repository.root.branches ? 'true' : 'false'}</p>
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