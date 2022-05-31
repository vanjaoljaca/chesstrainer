import './App.css';
// https://github.com/jhlywa/chess.js/blob/master/README.md
import { Chess, ChessInstance, ShortMove, Square } from "chess.js";
import { Branch, Line, MoveBranch, MoveRepository, Orientation, RootBranch, Fen, moveEquals } from './ChessTrainerShared';

export class ChessTrainer {
    mergeFromJson(json: any) {
      throw new Error("Method not implemented.");
    }
    readonly game: ChessInstance;
    repository: RootBranch;
    line: (Branch | RootBranch)[] = [];
    currentLine: Branch[] = []
    currentBranch: Branch | RootBranch = null
    end: boolean = false
    orientation: Orientation = 'black'
    arrows: [Square, Square][] = []
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
        if (this.isComputerMove()) {
            this.doComputerMove();
        }
    }

    static readonly REPOSITORY_KEY = 'REPOSITORY2';
    persistRepository() {
        this.deparentify(this.repository.branches);
        localStorage.setItem(ChessTrainer.REPOSITORY_KEY, JSON.stringify(this.repository));
        this.parentify(null, this.repository.branches)
    }

    loadRepository() {
        let json = localStorage.getItem(ChessTrainer.REPOSITORY_KEY);
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
        if (!this.isHumanMove())
            throw 'Not human move.'

        var candidate;

        let branches = this.currentBranch.branches;
        candidate = branches.find(b => moveEquals(b.move, { from, to }));
        if (candidate == null) {
            this.arrows = branches.map(b => [b.move.from, b.move.to]);
            return null;
        }
        let nextBranch = candidate;
        let nextMove = nextBranch.move;
       
        this.currentBranch = nextBranch;
        this.line.push(nextBranch)
        this.currentLine.push(nextBranch)
        this.game.move(nextMove);
        return this.currentBranch;
    }

    doComputerMove() {
        if (!this.isComputerMove()) {
            throw 'Not computer move.'
        }

        // let branches = this.branchesFromFen[this.game.fen()]
        if(!this.currentBranch) {
            return;
            this.currentBranch = this.repository.branches[0];
        }

        let branches = this.currentBranch.branches;
        if (!branches || branches.length == 0) {
            this.end = true;
            console.log('end of line')
            return;
        }
        let candidate = branches[Math.floor(Math.random() * branches.length)]
        let nextBranch = candidate;
        let nextMove = nextBranch.move;
        this.game.move(nextMove);
        this.currentBranch = nextBranch;
        this.currentLine.push(nextBranch)
        return nextBranch;
    }

    reset() {
        this.buildLine = []
        this.game.reset();
        this.currentBranch = this.repository
        this.currentLine = []
    }

    playRandomLine() {
        this.playLine(this.getRandomLine(this.repository));
    }

    playLine(line: Line) {
        this.line = line;
        this.currentBranch = this.repository
        this.game.reset();
        if (this.isComputerMove()) {
            this.doComputerMove();
        }
    }

    getRandomLine(repository: RootBranch): Line {
        let line = [];
        var currentBranches = repository.branches;
        var current = null;
        while (currentBranches != null && currentBranches.length != 0) {
            let i = Math.floor(Math.random() * currentBranches.length);
            current = currentBranches[i];
            currentBranches = current.branches;
            line.push(current);
        }
        return line;
    }

    fen() {
        return this.game.fen();
    }

    isComputerMove() {
        return !this.isHumanMove();
    }

    isHumanMove() {
        return this.game.turn() == this.orientation[0]
    }

    isDone() {
        return this.currentBranch.branches.length == 0;
    }
}