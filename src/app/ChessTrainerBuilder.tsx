import './App.css';
// https://github.com/jhlywa/chess.js/blob/master/README.md
import { Chess, ChessInstance, Move, ShortMove } from "../util/chess.js";
import { Branch, Orientation, moveEquals, MoveBranch, San, Line } from './ChessTrainerShared';
import { Repository } from './Repository';

export class ChessTrainerBuilder {

    readonly game: ChessInstance;
    readonly repository: Repository;

    // private buildLine: MoveBranch[] = []
    private _currentBranch: Branch
    orientation: Orientation

    constructor(repository: Repository, orientation: Orientation) {
        this.game = new Chess();
        this.repository = repository;
        this.orientation = orientation;
        this._currentBranch = this.repository.root
    }

    tryMove(m: San | ShortMove) {
        let move = this.game.move(m);
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
        if (this._currentBranch as MoveBranch == null)
            throw Error('Cant delete root');
        this.delete(this._currentBranch as MoveBranch)
    }

    delete(branch: Branch) {
        if (branch as MoveBranch == null) throw Error('Delete root not implemented')
        let nextBranch = (branch as MoveBranch).parent;
        if (nextBranch as Branch === null) throw Error('Delete root not implemented')
        this.repository.removeBranches([branch as MoveBranch]);
        this.currentBranch = nextBranch as Branch;
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
        let line: Line = []
        var current: Branch | undefined = branch;
        while (current !== undefined) {
            line.push(current);
            current = (current as MoveBranch).parent;
        }
        line.reverse();
        this.reset();
        for (let b of line) {
            if (b as MoveBranch)
                this.game.move((b as MoveBranch).move);
        }
        this._currentBranch = branch;
    }
}
