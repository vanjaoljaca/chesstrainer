import { PgnLoad } from '../../util/PgnLoad';
import fs from 'fs';
import { Branch, MoveBranch, Persistable, RootBranch } from '../../app/ChessTrainerShared';

test('PgnLoad', () => {
    let pgnGames = fs.readFileSync('./public/e4NYStyle.pgn', 'utf8')
        .slice(1); // lol why is this needed
    try {
        let r = PgnLoad.fromPgn(pgnGames);
        r //?
        expect(r).toBeDefined();
    } catch (e: any) {
        let x = pgnGames.slice(Math.max(0, e.location.start.offset - 30), Math.min(pgnGames.length, e.location.start.offset + 50)) //?
        console.log(x, e)
    }
});


test('branching white', () => {
    // let r2 = PgnLoad.fromPgn(pgn2.replace('\n', ''));//?
    // r2 //?
    let pgnGames = `1. e4 e5 (1 e6 e5 {ol}) 2. Nc3 Nf6  *`
    let r = PgnLoad.fromPgn(pgnGames);//?
    // this can be solved by pumping variations up via a queue since the variation has a move number
    expect(r[0].branches.length).toBe(2);
    expect(r[0].branches[0].branches.length).toBe(2);
    expect(r[0].branches[0].branches[0].branches.length).toBe(1);
});


test('branching black', () => {
    let pgnGames = `1. e4 d5 (1... c5 {blackalt}) 2. Nc3 Nf6  *`
    let r = PgnLoad.fromPgn(pgnGames);
    toString(r[0]) //?
    // can't know if its black or white with this pgn parser
    // so we put it in both an let someone else solve this...
    expect(r[0].branches.length).toBe(2);
    expect(r[0].branches[0].branches.length).toBe(2);
    expect(r[0].branches[0].branches[0].branches[0].san).toBe('Nc3');
});

test('branch in branch', () => {
    let pgnGame =
        `1. e4 e5 
         2. Qf3 Nxc3 {...} 
            (2... Nc6 {...} 
             3. Bb5 Nxc3 
                (3... f5 {...} 4. d3 Nxc3)
            ) 
         3. dxc3 Qh4+ *`
    // let pgnGame = `1. e4 e5 (1... Nc6) *`
    let r = PgnLoad.fromPgn(pgnGame);
    toString(r[0])
    expect(r[0].branches.length).toBe(1);
    expect(r[0].branches[0].branches.length).toBe(1);
    expect(r[0].branches[0].branches[0].branches.length).toBe(2);
    expect(r[0].branches[0].branches[0].branches[0].branches.length).toBe(2);
    expect(r[0].branches[0].branches[0].branches[0].branches.length).toBe(2);
    expect(r[0].branches[0].branches[0].branches[1].san).toBe('Nc6');
    expect(r[0].branches[0].branches[0].branches[1].branches[0].san).toBe('Bb5');
    expect(r[0].branches[0].branches[0].branches[1].branches[0].branches[0].san).toBe('Nxc3');
})

function toString(tree: Persistable<RootBranch>) {
    function toString(level, node: Persistable<Branch>) {
        let spacer = level + '| ';
        for (let i = 0; i < level; i++) {
            spacer += '   ';
        }
        spacer += ' |_ '
        let s = `${spacer + ((node as Persistable<MoveBranch>).san || 'root')} (${node.branches.length})\n`
        if (node.branches.length > 0) {
            for (let b of node.branches) {
                s += toString(level + 1, b);
            }
        }
        return s;
    }
    return toString(0, tree);
}