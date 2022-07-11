import { ShortMove, Square } from "chess.js";

export function move(from: Square, to: Square): ShortMove {
    return { from, to }
}

export function moveEquals(a: ShortMove, b: ShortMove): boolean {
    return a.from === b.from && a.to === b.to;
}

export type Branch = MoveBranch | RootBranch

export type MoveBranch = {
    name?: string,
    move: ShortMove,
    branches: MoveBranch[] | null
    played: number
    correct: number
    parent?: Branch | RootBranch
    comment?: string
}

export type FenBranch = {} /* todo */

export type RootBranch = Omit<MoveBranch, 'move' | 'played' | 'correct'>

export type Line = Branch[]

export type Orientation = 'black' | 'white'

export type MoveRepository = MoveBranch[]

export type Fen = string
