import { PgnLoad } from '../../util/PgnLoad';
import fs from 'fs';

test('PgnLoad', () => {
    // let r2 = PgnLoad.fromPgn(pgn2.replace('\n', ''));//?
    // r2 //?
    let pgnGames = fs.readFileSync('./public/e4NYStyle.pgn', 'utf8'); //?
    try {
        let r = PgnLoad.fromPgn(pgnGames);//?
        console.log(r)
        r //?
        expect(r).toBeDefined();
    } catch (e: any) {
        let x = pgnGames.slice(e.textOffset - 30, e.textOffset + 50) //?
        console.log(x)
        e //?
    }
});


test('branching black', () => {
    // let r2 = PgnLoad.fromPgn(pgn2.replace('\n', ''));//?
    // r2 //?
    let pgnGames = `1. e4 e5 (1... e6 {ol}) 2. Nc3 Nf6  *`
    let r = PgnLoad.fromPgn(pgnGames);//?

    expect(r[0].branches[0].branches.length).toBe(2);
    expect(r[0].branches[0].branches[0].branches.length).toBe(1);
    expect(r).toBeDefined();
});


test('branching white', () => {
    // let r2 = PgnLoad.fromPgn(pgn2.replace('\n', ''));//?
    // r2 //?
    let pgnGames = `1. e4 (1 d4) e5 (1 e3 {ol}) (1 e1 {other}) (1... d5 {black}) 2. Nc3 Nf6  *`
    let r = PgnLoad.fromPgn(pgnGames);//?

    expect(r[0].branches.length).toBe(2);
    expect(r[0].branches[0].branches.length).toBe(1);
    expect(r).toBeDefined();
});