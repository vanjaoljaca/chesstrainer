import { PgnLoad } from '../../util/PgnLoad';
import fs from 'fs';

test('PgnLoad', () => {
    // let r2 = PgnLoad.fromPgn(pgn2.replace('\n', ''));//?
    // r2 //?
    let pgnGames = fs.readFileSync('./public/e4NYStyle.pgn', 'utf8');
    var p = pgnGames.replace(/[ ]+\+/g, '+')
        .replace(/O - O - O/g, 'O-O-O')
        // .replace(/O - O - O/g, 'O-O-O')
        .replace(/O - O/g, 'O-O')
        // .replace(/O - O/g, 'O-O')
        .replace(/ \+/g, 'Qh4+');
    try {
        let r = PgnLoad.fromPgn(p);//?
        console.log(r)
        r //?
        expect(r).toBeDefined();
    } catch (e: any) {
        let x = p.slice(e.textOffset - 30, e.textOffset + 50) //?
        console.log(x)
        e //?
    }
});