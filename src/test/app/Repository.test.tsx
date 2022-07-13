import { Repository } from '../../app/Repository';

test('fen', () => {
    let repository = new Repository()
    repository.createBranches(null, [['e2', 'e4'], ['e7', 'e5']]);
    repository.generateFen();
    expect(repository.branchesFromFen).toBeTruthy();
});

test('dedupe', () => {
    let repository = new Repository()
    repository.createBranches(null, [['e2', 'e4'], ['e7', 'e5']]);
    repository.createBranches(null, [['e2', 'e4'], ['e7', 'e5']])
    expect(repository.root.branches.length).toBe(2)
});