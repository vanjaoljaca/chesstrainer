import './App.css';
// https://github.com/jhlywa/chess.js/blob/master/README.md
import { Chess, ChessInstance, ShortMove, Square } from "chess.js";
import { Branch, Line, Orientation, RootBranch, Fen, moveEquals } from './ChessTrainerShared';
import { Repository } from './Repository';

export class ChessTrainer {
    
    readonly game: ChessInstance;
    repository: Repository;
    line: (Branch | RootBranch)[] = [];
    currentLine: Branch[] = []
    currentBranch: Branch | RootBranch = null
    end: boolean = false
    orientation: Orientation = 'black'
    arrows: [Square, Square][] = []
    buildLine: ShortMove[] = []
    branchesFromFen: Map<Fen, Branch[]>

    constructor(repository: Repository, orientation?: Orientation) {
        console.log('game created')
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
        if (!this.isHumanMove())
            throw Error('Not human move.')

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
            throw Error('Not computer move.')
        }

        // let branches = this.branchesFromFen[this.game.fen()]
        if(!this.currentBranch) {
            return;
        }

        let branches = this.currentBranch.branches;
        if (!branches || branches.length === 0) {
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
        this.currentBranch = this.repository.root
        this.currentLine = []
    }

    playRandomLine() {
        this.playLine(this.getRandomLine(this.repository.root));
    }

    playLine(line: Line) {
        this.line = line;
        this.currentBranch = this.repository.root
        this.game.reset();
        if (this.isComputerMove()) {
            this.doComputerMove();
        }
    }

    getRandomLine(repository: RootBranch): Line {
        let line = [];
        var currentBranches = repository.branches;
        var current = null;
        while (currentBranches != null && currentBranches.length !== 0) {
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
        return this.game.turn() === this.orientation[0]
    }

    isDone() {
        return this.currentBranch.branches.length === 0;
    }
}