import './App.css';
// https://github.com/jhlywa/chess.js/blob/master/README.md
import { Chess, ChessInstance, ShortMove, Square } from "chess.js";
import { Branch, Line, MoveBranch, MoveRepository, Orientation, RootBranch, Fen, moveEquals, branch } from './ChessTrainerShared';

export class ChessTrainerBuilder {
    readonly game: ChessInstance;
    repository: RootBranch;
    line: (Branch | RootBranch)[] = [];
    currentLine: Branch[] = []
    currentBranch: Branch | RootBranch = null
    end: boolean = false
    orientation: Orientation = 'black'
    buildLine: ShortMove[] = []
    branchesFromFen: Map<Fen, Branch[]>

    constructor(moveRepository?: MoveRepository, orientation?: Orientation) {
        this.game = new Chess();
        this.orientation = orientation;
        if (moveRepository) {
            this.repository = {
                name: 'Root',
                branches: moveRepository
            }
        } else {
            this.repository = this.loadRepository()
        }
        this.currentBranch = this.repository
    }

    static readonly REPOSITORY_KEY = 'REPOSITORY';
    persistRepository() {
        this.deparentify(this.repository.branches);
        localStorage.setItem(ChessTrainerBuilder.REPOSITORY_KEY, JSON.stringify(this.repository));
        this.parentify(null, this.repository.branches)
    }

    loadRepository() {
        let json = localStorage.getItem(ChessTrainerBuilder.REPOSITORY_KEY);
        let parsed = JSON.parse(json);
        let repository: RootBranch = parsed ? parsed : { branches: [], name: 'root' }
        this.parentify(undefined, repository.branches)
        this.loadFen(repository.branches)
        console.log('Loaded repository:', this.repository)
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

    clearRepository() {
        localStorage.setItem(ChessTrainerBuilder.REPOSITORY_KEY, JSON.stringify({
            name: 'root',
            branches: []
        }));
        this.repository = this.loadRepository()
    }

    loadBranch(branch) {
        let line = []
        var current = branch;
        while(current != null) { 
            line.push(current);
            current = current.parent;
        }
        line.reverse();
        this.reset();
        for(let b of line) {
            this.game.move(b.move);
        }
        this.currentBranch = branch;
    }

    tryMove(from: Square, to: Square) {
        var candidate;

        if (!this.game.move({ from, to })) {
            return null;
        }
        let branches = this.currentBranch.branches;
        candidate = branches.find(b => moveEquals(b.move, { from, to }));
        if (candidate == null) {
            let newBranch = branch({ from, to });
            newBranch.parent = this.currentBranch; // todo: don't do this yet?
            branches.push(newBranch)
            candidate = newBranch;
        }
        this.currentBranch = candidate;
        this.line.push(this.currentBranch);
        this.currentLine.push(candidate);
        return this.currentBranch;
    }

    reset() {
        this.buildLine = []
        this.game.reset();
        this.currentBranch = this.repository
        this.currentLine = []
    }

    saveBuild() {
        // let builtLine = [];
        // if (this.building) {
        //     var current = this.currentBranch;
        //     while(current != null) {
        //         builtLine.push(current);
        //         current = current.parent;
        //     }
        // }
        this.persistRepository();
        this.loadFen(this.repository.branches);
    }

    fen() {
        return this.game.fen();
    }
}
