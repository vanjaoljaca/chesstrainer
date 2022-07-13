import './App.css';
// https://github.com/jhlywa/chess.js/blob/master/README.md
import { Chess, ChessInstance, ShortMove, Square } from "../util/chess.js";
import { Branch, Line, Orientation, RootBranch, Fen, moveEquals } from './ChessTrainerShared';
import { Repository } from './Repository';

export class ChessTrainer {
    
    readonly game: ChessInstance;
    repository: Repository;
    line: (Branch | RootBranch)[] = [];
    currentLine: Branch[] = []
    private _currentBranch: Branch | RootBranch = null
    end: boolean = false
    orientation: Orientation = 'black'
    arrows: [Square, Square][] = []
    buildLine: ShortMove[] = []
    branchesFromFen: Map<Fen, Branch[]>
    hint: string

    constructor(repository: Repository, orientation?: Orientation) {
        this.game = new Chess();
        this.repository = repository;
        this.orientation = orientation;
        this._currentBranch = this.repository.root
    }

    tryMove(from: Square, to: Square) {
        if (!this.isHumanMove())
            throw Error('Not human move.')

        let isValid = this.game.move({from, to})

        if(!isValid)
            throw Error('Not a valid move')

        this.game.undo();

        let branches = this._currentBranch.branches;
        let candidate = branches.find(b => moveEquals(b.move, { from, to }));
        if (candidate == null) {
            this.showHint()
            return null;
        }
        this.clearHint();
        let nextBranch = candidate;
        let nextMove = nextBranch.move;
       
        this._currentBranch = nextBranch;
        this.line.push(nextBranch)
        this.currentLine.push(nextBranch)
        this.game.move(nextMove);
        return this._currentBranch;
    }

    showHint() {
        this.arrows = this._currentBranch.branches.map(b => [b.move.from, b.move.to]);
        this.hint = this._currentBranch.comment
    }

    clearHint() {
        this.arrows = [];
        this.hint = null;
    }

    doComputerMove() {
        if (!this.isComputerMove()) {
            throw Error('Not computer move.')
        }

        // let branches = this.branchesFromFen[this.game.fen()]
        if(!this._currentBranch) {
            return;
        }

        let branches = this._currentBranch.branches;
        if (!branches || branches.length === 0) {
            this.end = true;
            return;
        }
        let candidate = branches[Math.floor(Math.random() * branches.length)]
        let nextBranch = candidate;
        let nextMove = nextBranch.move;
        this.game.move(nextMove);
        this._currentBranch = nextBranch;
        this.currentLine.push(nextBranch)
        return nextBranch;
    }

    reset() {
        this.buildLine = []
        this.game.reset();
        this._currentBranch = this.repository.root
        this.currentLine = []
        this.arrows = []
    }

    playRandomLine() {
        this.playLine(this.getRandomLine(this.repository.root));
    }

    playLine(line: Line) {
        this.line = line;
        this._currentBranch = this.repository.root
        this.game.reset();
        if (this.isComputerMove()) {
            this.doComputerMove();
        }
    }

    getRandomLine(repository: RootBranch): Line {
        let line = [];
        var _currentBranches = repository.branches;
        var current = null;
        while (_currentBranches != null && _currentBranches.length !== 0) {
            let i = Math.floor(Math.random() * _currentBranches.length);
            current = _currentBranches[i];
            _currentBranches = current.branches;
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
        return this.game.turn() === this.orientation[0]
    }

    isDone() {
        return this._currentBranch.branches.length === 0;
    }

    get currentBranch() {
        return this._currentBranch;
    }

    set currentBranch(b: Branch) {
        this.loadBranch(b || this.repository.root);
    }

    private loadBranch(branch) {
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
        this._currentBranch = branch;
    }
}