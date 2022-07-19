import { Chess, Square, Move, ChessInstance } from "../util/chess.js";
import { Branch, Fen, Line, MoveBranch, Persistable, RootBranch } from "./ChessTrainerShared";
import _ from "lodash";

export function branch(parent: Branch, move: Move, ...branches: MoveBranch[]): MoveBranch {
    return { move, san: move.san, branches: branches || [], played: 0, correct: 0, parent }
}

export class Repository {

    static readonly REPOSITORY_KEY = 'REPOSITORY2';

    root: RootBranch
    branchesFromFen: Map<Fen, Branch[]>

    constructor() {
        this.root = { branches: [], name: 'root', parent: undefined }
        this.branchesFromFen = new Map<Fen, Branch[]>()
    }

    addBranches(branches: MoveBranch[]) {
        for (let branch of branches) {
            branch.parent.branches.push(branch);
        }
        this.generateFenPartial(branches);
    }

    createBranchesDebug(moves: [Square, Square][]) {
        let chess = Chess();
        var currentBranch: Branch | null = null;
        for (let i = 0; i < moves.length; i++) {
            let move = moves[i];
            let m = chess.move({ from: move[0], to: move[1] });
            if (m === null)
                throw Error('invalid move: ' + JSON.stringify(branch));
            currentBranch = this.createBranch(currentBranch, m);
        }
        return currentBranch;
    }

    createBranch(parent: Branch | null, move: Move): MoveBranch {
        if (parent === null) parent = this.root;
        // todo check for dupe
        let newBranch = branch(parent, move);
        parent.branches.push(newBranch);
        this.generateFenPartial([newBranch]);
        return newBranch;
    }

    removeBranches(branches: MoveBranch[]) {
        for (let branch of branches) {
            branch.parent.branches.splice(branch.parent.branches.indexOf(branch), 1);
            let fen = Repository.getFen(branch.parent)
            this.branchesFromFen[fen].splice(this.branchesFromFen[fen].indexOf(branch), 1)
        }
    }

    generateFen() {
        let result = new Map<Fen, Branch[]>();
        let game = Chess()
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
            if (branch.parent === undefined) continue;
            let fen = Repository.getFen(branch.parent);
            if (this.branchesFromFen[fen] === undefined)
                this.branchesFromFen[fen] = []
            this.branchesFromFen[fen].push(branch);
        }
    }

    dedupe() {
        let dedupe = (branch: Branch) => {
            let deduped: MoveBranch[] = [];
            for (let child of branch.branches) {
                let inDeduped = deduped.find(b => child.san === b.san);
                if (inDeduped) {
                    Repository.copyInto(child, inDeduped);
                } else {
                    dedupe(child);
                    deduped.push(child);
                }
            }
            branch.branches = deduped;
        }

        dedupe(this.root);
    }

    merge(repository: RootBranch) { // classical 8 e7 f6
        Repository.copyInto(repository, this.root);
        this.generateFen();
    }

    unpersist(persistable: Persistable<RootBranch>) {
        this.root = Repository.unpersist(Chess(), persistable);
        this.generateFen();
    }

    private static unpersist<T extends RootBranch>(game: ChessInstance, persistable: Persistable<T>): T {
        if (game === null)
            game = Chess();
        let branch: T = { ...persistable } as any;
        let branches = persistable.branches.map(b => Repository.unpersist3(game, b));
        branches.forEach(b => b.parent = branch);
        branch.branches = branches;
        return branch as T;
    }

    private static unpersist3<T extends MoveBranch>(game: ChessInstance, persistable: Persistable<T>): T {
        let branch: T = { ...persistable } as any;
        let m;
        if (persistable.san !== undefined) {
            console.log('move', persistable.san)
            m = game.move(persistable.san);
            if (m === null) {
                console.log(game, persistable, m, game.moves());
                throw Error('invalid move: ' + persistable.san);
            }
        }
        let branches = persistable.branches.map(b => Repository.unpersist3(game, b));
        branches.forEach(b => b.parent = branch);
        branch.branches = branches;
        if (persistable.san !== undefined) {
            console.log('undo')
            game.undo();
            branch.move = m;
        }
        return branch as T;
    }

    persistable(): Persistable<RootBranch> {
        return Repository.persistable(this.root);
    }

    private static persistable<T extends Branch>(branch: T): Persistable<T> {
        let persistableBranches = branch.branches.map(Repository.persistable);
        let persistable = {
            ...branch,
            branches: persistableBranches
        }
        delete persistable.parent
        return persistable as unknown as Persistable<T>;
    }

    static getFen(branch: Branch) {
        let line: Line = [];
        var current: Branch | undefined = branch;
        while (current !== undefined) {
            line.push(current);
            current = current.parent
        }
        let game = Chess();
        for (var i = line.length - 1; i >= 0; i--) {
            game.move((line[i] as MoveBranch).san); // eek
        }
        return game.fen();
    }

    static copyInto(source: Branch, target: Branch) {
        if (!target.branches)
            target.branches = []

        var toAdd: MoveBranch[] = []
        for (let branch of source.branches) {
            let inTarget = target.branches.find(b => branch.san === b.san);
            if (inTarget) {
                Repository.copyInto(branch, inTarget);
            } else {
                toAdd.push(branch);
            }
        }
        for (var i = toAdd.length - 1; i >= 0; i--) {
            target.branches.push(toAdd[i]);
        }
    }
}