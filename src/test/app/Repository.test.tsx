import { Repository } from '../../app/Repository';

let sut: Repository;
beforeEach(() => {
    sut = new Repository()
    sut.createBranchesDebug([['e2', 'e4'], ['e7', 'e5']]);
    sut.createBranchesDebug([['e2', 'e4'], ['d7', 'd5']])
})

test('fen', () => {
    sut.generateFen();
    expect(sut.branchesFromFen).toBeTruthy();
});

test('dedupe', () => {
    expect(sut.root.branches.length).toBe(2)
});

test('lol', () => {
    let p = sut.persistable();
    let json = JSON.stringify(p);
    expect(json).toBeTruthy();
});

test('lol el dos', () => {
    let p = sut.persistable();
    let r = new Repository();
    p //? 
    r.unpersist(p);
});