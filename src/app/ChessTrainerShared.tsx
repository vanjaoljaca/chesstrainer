import { ShortMove, Square } from "../util/chess.js";

export function move(from: Square, to: Square): ShortMove {
    return { from, to }
}

export type Branch = ChildBranch | RootBranch

export type ChildBranch = MoveBranch

export type MoveBranch = {
    name?: string,
    san: San,
    move: ShortMove,
    branches: MoveBranch[] // todo: ChildBranch
    played: number
    correct: number
    parent: Branch
    comment?: string
}

export type Persistable<T extends Branch> = Omit<T, 'parent' | 'branches' | 'move'> & {
    branches: Persistable<ChildBranch>[]
}

export type FenBranch = {} /* todo */

export type RootBranch = Omit<MoveBranch, 'move' | 'played' | 'correct' | 'parent' | 'san'> & {
    parent: undefined
}

export type Line = Branch[]

export type Orientation = 'black' | 'white'

export type MoveRepository = MoveBranch[]

export type Fen = string

export type San = string