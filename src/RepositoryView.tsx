import { useState } from "react"
import { Branch, MoveBranch, RootBranch } from './ChessTrainerShared'
import { Repository } from "./Repository";
import TreeView from "./TreeView";

function BranchView({ branch, level, onSelected, selected }) {
    // if(level >= 3)
    //     return <p>...</p>;
    // let [collapsed, setCollapsed] = useState(() => level >= 9999);

    function onClick(a) {
        // setCollapsed(c => !c);
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
                    level + ' ' + branch.move.from + '->' + branch.move.to + (branch === selected ? ' * ' : ' ') + (branch.name ? branch.name : '')
                )}
                // collapsed={false}
                onClick={onClick}>
                {branch.branches.map((b, i) => {
                    return (
                        <div key={i} style={{marginLeft: 20}}>
                            <BranchView branch={b} level={level+1} onSelected={onChildSelected} selected={selected}/>
                        </div>
                    )
                })}
            </TreeView>
        </div>
    );
}

function findParent(branch: MoveBranch, level: number) {
    var current = branch;
    if(current == null) return null;
    for(var i = 0; i < level; i++) {
        if(current.parent as MoveBranch == null)
            return current.parent;
        current = current.parent as MoveBranch;
    }
    return current;
}

function findDepth(branch: Branch) {
    var current = branch;
    var i = 0;
    while((current as RootBranch == null)) {
        i++;
        current = (current as MoveBranch).parent;
    }
    return i;
}

type RepositoryViewProps = {
    repository: Repository, 
    onSelected: (branch: Branch) => void
}

export function RepositoryView({ repository, onSelected }: RepositoryViewProps) {
    let [selected, setSelected] = useState(null)
    let [level, setLevel] = useState(0);

    if(!repository)
        return <p>null repo</p>

    function onChildSelected({branch, level}) {
        setSelected(branch);
        setLevel(findDepth(branch))
        // setLevel(level)
        onSelected && onSelected(branch);
    }

    let parentLevel = findParent(selected, 3);

    let root = true || selected == null || parentLevel == null
        ? repository.root.branches
        : parentLevel.branches;
    
    return (
        <div style={{border: 'solid', textAlign: 'left'}}>
            <h3>Moves</h3>
            {/* <p>root is repository: {root === repository.root.branches ? 'true' : 'false'}</p>
            <p>findParentLevel: {parentLevel != null && 'move' in parentLevel ? parentLevel.move.from : 'null'}</p> */}
            {root.map((b, i) => {
                return (
                    // <TreeView key={i} branch={b}
                    //     nodeLabel={b.move.from + '->' + b.move.to}
                    //     onClick={onClick}>
                            // <div style={{marginLeft: 60}}>
                                <BranchView key={i} branch={b} level={level} onSelected={onChildSelected} selected={selected}/>
                            // </div>
                    // </TreeView>
                );
            })}
        </div>
    );
}