import { Branch, MoveBranch, Persistable, RootBranch } from "../app/ChessTrainerShared";
import * as PgnParser2 from '@mliebelt/pgn-parser'
// import * as PgnParser3 from 'pgn-parser';
// import { PgnParser } from '@chess-fu/pgn-parser';
// import { parse } from './PgnParser'

export class PgnLoad {
    public static fromPgn(raw: string): Persistable<RootBranch>[] {
        let clean = raw.replace(/[ ]+\+/g, '+')
            .replace(/O - O - O/g, 'O-O-O')
            .replace(/O - O/g, 'O-O');
        let pgn = PgnParser2.parseGames(clean, { startRule: 'games' });
        let roots = pgn.map(PgnLoad.toRoot)
        return roots;
    }

    private static toRoot(pgn: PgnParser2.ParseTree): Persistable<RootBranch> {
        let name = pgn.tags ? pgn.tags['White'] + ' ' + pgn.tags['Black']
            : 'Unnamed';

        let mainline = PgnLoad.toMoveBranches(pgn.moves);

        // variation
        let variations: Persistable<MoveBranch>[][] = [];
        for (var i = 0; i < pgn.moves.length; i++) {
            let m = pgn.moves[i];
            let alts = m.variations.flatMap(PgnLoad.fromLine);
            variations.push(alts);
            // if (m.turn === 'b') { // todo: why is this always black??
            if (variations.length > 1) {
                // ok this might be white.. put them in both this black move and the previous white move
                // just in case this was a (1... c5) kind of move
                // disable this for now while debugging..
                variations[variations.length - 2] = variations[variations.length - 2].concat(alts);
            }
        }

        let root = {
            name: name,
            branches: mainline
        } as Persistable<RootBranch>;

        // walk the mainline and merge in the variations
        var current: Persistable<Branch> = root;
        for (var j = 0; j < variations.length; j++) {
            current.branches = current.branches.concat(variations[j]);
            current = current.branches[0];
        }

        return root;
    }

    private static fromLine(moves: PgnParser2.PgnMove[]): Persistable<MoveBranch>[] {
        let mainline = PgnLoad.toMoveBranches(moves);

        // variation
        let variationLinesPerMove: Persistable<MoveBranch>[][] = [];
        for (var i = 0; i < moves.length; i++) {
            let m = moves[i];
            let alts = m.variations.flatMap(PgnLoad.fromLine);
            variationLinesPerMove.push(alts);
            // if (m.turn === 'b') { // todo: why is this always black??
            if (variationLinesPerMove.length > 1) {
                // ok this might be white.. put them in both this black move and the previous white move
                // just in case this was a (1... c5) kind of move
                // disable this for now while debugging..
                variationLinesPerMove[variationLinesPerMove.length - 2] = variationLinesPerMove[variationLinesPerMove.length - 2].concat(alts);
            }
        }

        var current: Persistable<Branch> = mainline[0];
        for (var j = 1; j < variationLinesPerMove.length; j++) {
            current.branches = current.branches.concat(variationLinesPerMove[j]);
            current = current.branches[0];
        }

        return [mainline[0]].concat(variationLinesPerMove[0]);
    }

    // stupidly confusing, this array is temporal
    // it has multiple sequential moves
    // unlike the variations which have moves at one point in time
    private static toMoveBranches(moves: PgnParser2.PgnMove[]): Persistable<MoveBranch>[] {
        var firstBranch: Persistable<MoveBranch> | null = null
        var currentBranch: Persistable<MoveBranch> | null = null
        for (let move of moves) {
            let branch = PgnLoad.toMoveBranchNoVariations(move);
            if (currentBranch !== null) {
                currentBranch.branches = [branch];
            }
            currentBranch = branch
            firstBranch = firstBranch || branch
        }
        if (firstBranch === null) {
            throw Error('no moves found');
        }
        return [firstBranch];
    }

    private static toMoveBranchNoVariations(move: PgnParser2.PgnMove): Persistable<MoveBranch> {
        return {
            played: 0,
            correct: 0,
            comment: move.commentAfter,
            san: move.notation.notation,
            branches: []
        } as Persistable<MoveBranch>;
    }

    private static toMoveBranch(move: PgnParser2.PgnMove): Persistable<MoveBranch> {
        return {
            played: 0,
            correct: 0,
            comment: move.commentAfter,
            san: move.notation.notation,
            branches: move.variations.map(m => m[0]).map(PgnLoad.toMoveBranch)
        } as Persistable<MoveBranch>;
    }
}