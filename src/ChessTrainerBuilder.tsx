import './App.css';
// https://github.com/jhlywa/chess.js/blob/master/README.md
import { Chess, ChessInstance, Move, ShortMove } from "chess.js";
import { Branch, Orientation, moveEquals, MoveBranch } from './ChessTrainerShared';
import { Repository } from './Repository';

export type San = string

export class ChessTrainerBuilder {
    
    readonly game: ChessInstance;
    readonly repository: Repository;

    // private buildLine: MoveBranch[] = []
    private _currentBranch: Branch = null
    orientation: Orientation = 'black' // todo: private, default white?

    constructor(repository: Repository, orientation?: Orientation) {
        this.game = new Chess();
        this.repository = repository;
        this.orientation = orientation;
        this._currentBranch = this.repository.root
    }

    tryMove(san: San | ShortMove) {
        let move = this.game.move(san);
        if (!move) {
            return null;
        }
        return this.move(move);
    }

    private move(move: Move) {
        let branches = this._currentBranch.branches;
        var candidate = branches.find(b => moveEquals(b.move, move));
        if (candidate == null) {
            candidate = this.repository.createBranch(this._currentBranch, move);
        }
        this._currentBranch = candidate;
        return this._currentBranch;
    }

    reset() {
        this.game.reset();
        this._currentBranch = this.repository.root
    }

    deleteCurrent() {
        if(this._currentBranch as MoveBranch == null)
            throw Error('Cant delete root');
        this.delete(this._currentBranch as MoveBranch)
    }

    delete(branch: Branch) {
        if(branch as MoveBranch == null) throw Error('Delete root not implemented')
        let nextBranch = branch.parent;
        this.repository.removeBranches([branch as MoveBranch]);
        this.currentBranch = nextBranch;
    }

    get fen() {
        return this.game.fen();
    }

    get isEnd() {
        return this._currentBranch == null
            || this._currentBranch.branches == null
            || this._currentBranch.branches.length === 0;
    }

    get currentBranch() {
        return this._currentBranch;
    }

    set currentBranch(branch: Branch) {
        this.loadBranch(branch)
    }

    private loadBranch(branch: Branch) {
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
