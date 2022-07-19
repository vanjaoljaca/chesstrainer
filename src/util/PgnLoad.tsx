import { MoveBranch, Persistable, RootBranch } from "../app/ChessTrainerShared";
import * as PgnParser2 from '@mliebelt/pgn-parser'
import * as PgnParser3 from 'pgn-parser';
import { PgnParser } from '@chess-fu/pgn-parser';


export class PgnLoad {
    public static fromPgn(raw: string): Persistable<RootBranch>[] {
        let clean = raw.replace(/[ ]+\+/g, '+')
            .replace(/O - O - O/g, 'O-O-O')
            // .replace(/O - O - O/g, 'O-O-O')
            .replace(/O - O/g, 'O-O')
            // .replace(/O - O/g, 'O-O')
            .replace(/ \+/g, 'Qh4+');
        let parser = new PgnParser();
        let r = parser.parse(clean) //?
        r//?
        return null;
        let pgn = PgnParser2.parseGames(clean, { startRule: 'games' });
        let root = pgn.slice(0, 1).map(PgnLoad.toRoot) //?
        return root;
    }

    private static toRoot(pgn: PgnParser.ParseTree): Persistable<RootBranch> {
        let branches = PgnLoad.toMoveBranches(pgn.moves);
        let name;
        if (pgn.tags) {
            name = pgn.tags['White'] + ' ' + pgn.tags['Black']
        } else {
            name = 'Unnamed';
        }
        return {
            name: name,
            branches
        } as RootBranch;
    }

    private static toMoveBranches(moves: PgnParser.PgnMove[]): Persistable<MoveBranch>[] {
        var branches: Persistable<MoveBranch>[] = []
        var currentBranch: Persistable<MoveBranch> | null = null
        for (let move of moves) {
            let newBranch = PgnLoad.toMoveBranch(move);
            if (currentBranch === null) {
                branches.push(newBranch);
            } else {
                currentBranch.branches.push(newBranch);
            }
            currentBranch = newBranch
        }
        return branches;
    }

    private static toMoveBranch(move: PgnParser.PgnMove): Persistable<MoveBranch> {
        // todo: variations here is wrong...
        if (move.variations && move.variations.length > 0) {
            // todo: the variations data here is garbage
            // move //?
            // move.variations //?
        }

        let branches = [] //move.variations.flatMap(PgnLoad.toMoveBranches);
        return {
            played: 0,
            correct: 0,
            comment: move.commentAfter,
            san: move.notation.notation, // todo
            branches
        } as Persistable<MoveBranch>;
    }
}