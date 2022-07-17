import { Repository } from '../../app/Repository';

let sut: Repository;
beforeEach(() => {
    sut = new Repository()
    sut.createBranches(null, [['e2', 'e4'], ['e7', 'e5']]);
    sut.createBranches(null, [['e2', 'e4'], ['e7', 'e5']])
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