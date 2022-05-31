import { Chess } from "chess.js";
import { Branch, Fen, MoveBranch, MoveRepository, RootBranch } from "./ChessTrainerShared";

export class Repository {
    
    static readonly REPOSITORY_KEY = 'REPOSITORY2';

    root: RootBranch
    branchesFromFen: Map<Fen, Branch[]>

    constructor() {
        
    }
    
    persistRepository() {
        this.deparentify(this.root.branches);
        localStorage.setItem(Repository.REPOSITORY_KEY, JSON.stringify(this.root));
        this.parentify(null, this.root.branches)
    }

    loadRepository() {
        let json = localStorage.getItem(Repository.REPOSITORY_KEY);
        let parsed = JSON.parse(json);
        let repository: RootBranch = parsed ? parsed : { branches: [], name: 'root' }
        this.parentify(undefined, repository.branches)
        this.loadFen(repository.branches)
        console.log('Loaded repository:', this.root)
        return repository
    }

    deparentify(branches: MoveBranch[]) {
        for (let branch of branches) {
            branch.parent = undefined;
            this.deparentify(branch.branches);
        }
    }

    parentify(parent: any, branches: MoveBranch[]) {
        for (let branch of branches) {
            branch.parent = parent;
            this.parentify(branch, branch.branches);
        }
    }

    loadFen(repository: MoveRepository) {
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
        dfs(repository);
        this.branchesFromFen = result;
    }

    getRepositoryJson() {
        this.deparentify(this.root.branches);
        let json = JSON.stringify(this.root);
        this.parentify(null, this.root.branches)
        return json;
    }

    mergeFromJson(repository: RootBranch) {
        console.log('merge from json')
        this.parentify(undefined, repository.branches)
        this.loadFen(repository.branches);
        this.root = repository;
    }

    clearRepository() {
        localStorage.setItem(Repository.REPOSITORY_KEY, JSON.stringify({
            name: 'root',
            branches: []
        }));
        this.root = this.loadRepository()
    }

    saveBranches(branches: MoveBranch[]) {
        for(let branch of branches) {
            branch.parent.branches.push(branch);
        }
        this.loadFenPartial(branches);
    }

    loadFenPartial(branches: Branch[]) {

        // todo fenFromBranch
        // todo: fenId
        for(let branch of branches) {
            if(!('parent' in branch)) continue;
            let fen = this.getFen(branch.parent);
            if(this.branchesFromFen[fen] == undefined)
                this.branchesFromFen[fen] = []
            this.branchesFromFen[fen].push(branch);
        }
    }

    getFen(branch: Branch) {
        let line = [];
        var current = branch;
        while(current != null) {
            line.push(current);
            current = 'parent' in current ? current.parent : null;
        }
        let game = new Chess();
        for(var i = line.length; i >= 0; i--) {
            game.move(line[i].move);
        }
        return game.fen();
    }
}