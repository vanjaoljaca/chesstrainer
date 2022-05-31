import { Chess } from "chess.js";
import { Branch, Fen, MoveBranch, moveEquals, RootBranch } from "./ChessTrainerShared";

export class Repository {

    static readonly REPOSITORY_KEY = 'REPOSITORY2';

    root: RootBranch
    branchesFromFen: Map<Fen, Branch[]>

    constructor() {
        this.root = { branches: [], name: 'root' }
        this.branchesFromFen = new Map<Fen, Branch[]>()
    }

    addBranches(branches: MoveBranch[]) {
        for (let branch of branches) {
            branch.parent.branches.push(branch);
        }
        this.generateFenPartial(branches);
    }

    generateFen() {
        let result = new Map<Fen, Branch[]>();
        let game = new Chess()
        let dfs = (branches) => {
            let fen = game.fen();
            let fenBranches = result.get(fen) || []
            result[fen] = fenBranches;
            for (let branch of branches) {
                fenBranches.push(branch);
                game.move(branch.move);
                dfs(branch.branches);
                game.undo();
            }
        }
        dfs(this.root.branches);
        this.branchesFromFen = result;
    }

    generateFenPartial(branches: Branch[]) {
        // todo fenFromBranch
        // todo: fenId
        for (let branch of branches) {
            if (!('parent' in branch)) continue;
            let fen = Repository.getFen(branch.parent);
            if (this.branchesFromFen[fen] === undefined)
                this.branchesFromFen[fen] = []
            this.branchesFromFen[fen].push(branch);
        }
    }

    merge(repository: RootBranch) {
        Repository.copyInto(repository, this.root);
        Repository.parentify(undefined, repository.branches)
        this.generateFen();
    }

    mergeFromLocal() {
        let json = localStorage.getItem(Repository.REPOSITORY_KEY);
        let parsed = JSON.parse(json);
        let repository: RootBranch = parsed ? parsed : { branches: [], name: 'root' }
        this.merge(repository);
    }

    clearRepository() {
        localStorage.setItem(Repository.REPOSITORY_KEY, JSON.stringify({
            name: 'root',
            branches: []
        }));
        this.root = Repository.loadFromLocal()
    }

    json() {
        Repository.deparentify(this.root.branches);
        let json = JSON.stringify(this.root);
        Repository.parentify(null, this.root.branches)
        return json;
    }

    static saveToLocal(root: RootBranch) {
        Repository.deparentify(root.branches);
        localStorage.setItem(Repository.REPOSITORY_KEY, JSON.stringify(root));
        Repository.parentify(null, root.branches)
    }

    static loadFromLocal() : RootBranch {
        let json = localStorage.getItem(Repository.REPOSITORY_KEY);
        let parsed = JSON.parse(json);
        let repository: RootBranch = parsed ? parsed : { branches: [], name: 'root' }
        Repository.parentify(undefined, repository.branches)
        // this.loadFen(repository.branches)
        return repository
    }

    static deparentify(branches: MoveBranch[]) {
        for (let branch of branches) {
            branch.parent = undefined;
            Repository.deparentify(branch.branches);
        }
    }

    static parentify(parent: any, branches: MoveBranch[]) {
        for (let branch of branches) {
            branch.parent = parent;
            Repository.parentify(branch, branch.branches);
        }
    }

    static getFen(branch: Branch) {
        let line = [];
        var current = branch;
        while (current != null) {
            line.push(current);
            current = 'parent' in current ? current.parent : null;
        }
        let game = new Chess();
        for (var i = line.length; i >= 0; i--) {
            game.move(line[i].move);
        }
        return game.fen();
    }

    static copyInto(source: Branch, target: Branch) {
        // assert source.move == target.move
        if(!target.branches)
            target.branches = []

        var toAdd = []
        for(let branch of source.branches) {
            let inTarget = target.branches.find(b => moveEquals(branch.move, b.move));
            if(inTarget) {
                Repository.copyInto(branch, inTarget);
            } else {
                toAdd.push(branch);
            }
        }
        for(var i = toAdd.length - 1; i >= 0; i--) {
            target.branches.push(toAdd[i]);
        }
    }
}