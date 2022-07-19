import { RepositoryView } from '../../app/RepositoryView'
import { render, screen } from '@testing-library/react';
import { Repository } from '../../app/Repository';
import { ChessTrainerView } from '../../app/ChessTrainerView';
import { ChessTrainer } from '../../app/ChessTrainer';
import { ModuleSelector } from '../../app/ModuleSelector';
import { Module } from '../../app/ModuleBrowser';
import { ChessTrainerBuilder } from '../../app/ChessTrainerBuilder';
import { ChessTrainerBuilderView } from '../../app/ChessTrainerBuilderView';

test('renders', () => {
    let repository = new Repository()
    repository.createBranchesDebug([['e2', 'e4'], ['e7', 'e5']]);
    function handleSelected() {

    }
    render(<RepositoryView repository={repository} onSelected={handleSelected} />);
    const branch = screen.getByText(/E2/i);
    expect(branch).toBeInTheDocument();
});


test('starts with human move', () => {
    let repository = new Repository()
    repository.createBranchesDebug([['e2', 'e4'], ['e7', 'e5']]);
    let whiteTrainer = new ChessTrainer(repository, 'white');
    render(<ChessTrainerView trainer={whiteTrainer} />);
    expect(whiteTrainer.isHumanMove()).toBe(true);
    let blackTrainer = new ChessTrainer(repository, 'black');
    render(<ChessTrainerView trainer={blackTrainer} />);
    expect(blackTrainer.isHumanMove()).toBe(true);
});

test('CTV', () => {
    let repository = new Repository()
    repository.createBranchesDebug([['e2', 'e4'], ['e7', 'e5']]);
    let whiteTrainer = new ChessTrainerBuilder(repository, 'white');
    render(<ChessTrainerBuilderView trainer={whiteTrainer} />);

    let blackTrainer = new ChessTrainerBuilder(repository, 'black');
    render(<ChessTrainerBuilderView trainer={blackTrainer} />);
});

test('mod sel', () => {
    let modules: Module[] = [
        { name: 'caro-kann', source: 'local', orientation: 'black' }
    ];
    let handleSelected = jest.fn();
    render(<ModuleSelector modules={modules} onSelected={handleSelected} />)
})