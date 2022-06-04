import './App.css';
// https://github.com/jhlywa/chess.js/blob/master/README.md
import { Chess, ChessInstance, Square } from "chess.js";
import { Branch, Orientation, RootBranch, moveEquals, branch, MoveBranch } from './ChessTrainerShared';
import { Repository } from './Repository';

export class ChessTrainerBuilder {
    
    readonly game: ChessInstance;
    readonly repository: Repository;

    private buildLine: MoveBranch[] = []
    private _currentBranch: Branch = null
    orientation: Orientation = 'black' // todo: private, default white?

    constructor(repository: Repository, orientation?: Orientation) {
        this.game = new Chess();
        this.repository = repository;
        this.orientation = orientation;
        this._currentBranch = this.repository.root
    }

    tryMove(from: Square, to: Square) {

        if (!this.game.move({ from, to })) {
            return null;
        }
        
        let branches = this._currentBranch.branches;
        var candidate = branches.find(b => moveEquals(b.move, { from, to }));
        if (candidate == null) {
            let newBranch = branch({ from, to });
            newBranch.parent = this._currentBranch;
            this.buildLine.push(newBranch);
            candidate = newBranch;
        }
        this._currentBranch = candidate;
        return this._currentBranch;
    }

    reset() {
        this.game.reset();
        this._currentBranch = this.repository.root
        this.buildLine = []
    }

    saveBuild() {
        this.repository.addBranches(this.buildLine);
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
