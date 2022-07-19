import { MoveBranch, Persistable, RootBranch } from "../app/ChessTrainerShared";
import * as PgnParser from '@mliebelt/pgn-parser'
import { ShortMove } from "./chess";

export class PgnLoad {
    public static fromPgn(rawRaw: string): Persistable<RootBranch>[] {
        let raw = rawRaw.replace(/[ ]+\+/g, '+')
            .replace(/O - O - O/g, 'O-O-O')
            // .replace(/O - O - O/g, 'O-O-O')
            .replace(/O - O/g, 'O-O')
            // .replace(/O - O/g, 'O-O')
            .replace(/ \+/g, 'Qh4+');
        let pgn = PgnParser.parseGames(raw, { startRule: 'games' });
        console.log(pgn.length)//?
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
        let branches = move.variations.flatMap(PgnLoad.toMoveBranches);
        return {
            played: 0,
            correct: 0,
            comment: move.commentAfter,
            move: move.notation.notation as unknown as ShortMove, // todo
            branches
        } as Persistable<MoveBranch>;
    }
}