import './App.css';
// https://github.com/jhlywa/chess.js/blob/master/README.md
import { Chess, ChessInstance, Square } from "chess.js";
import { Branch, Orientation, RootBranch, moveEquals, branch, MoveBranch } from './ChessTrainerShared';
import { Repository } from './Repository';

export class ChessTrainerBuilder {
    
    readonly game: ChessInstance;
    readonly repository: Repository;

    currentBranch: Branch | RootBranch = null
    orientation: Orientation = 'black'
    buildLine: MoveBranch[] = []

    constructor(repository: Repository, orientation?: Orientation) {
        this.game = new Chess();
        this.repository = repository;
        this.orientation = orientation;
        this.currentBranch = this.repository.root
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

        if (!this.game.move({ from, to })) {
            return null;
        }
        
        let branches = this.currentBranch.branches;
        var candidate = branches.find(b => moveEquals(b.move, { from, to }));
        if (candidate == null) {
            let newBranch = branch({ from, to });
            newBranch.parent = this.currentBranch;
            this.buildLine.push(newBranch);
            candidate = newBranch;
        }
        this.currentBranch = candidate;
        return this.currentBranch;
    }

    reset() {
        this.game.reset();
        this.currentBranch = this.repository.root
        this.buildLine = []
    }

    saveBuild() {
        this.repository.addBranches(this.buildLine);
    }

    delete(branch: MoveBranch) {
        this.repository.removeBranches([branch]);
    }

    get fen() {
        return this.game.fen();
    }

    get isEnd() {
        return this.currentBranch == null
            || this.currentBranch.branches == null
            || this.currentBranch.branches.length === 0;
    }
}
