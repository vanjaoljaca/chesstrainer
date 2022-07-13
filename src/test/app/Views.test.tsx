import { RepositoryView } from '../../app/RepositoryView'
import { render, screen } from '@testing-library/react';
import { Repository } from '../../app/Repository';

test('renders learn react link', () => {
    let repository = new Repository()
    repository.createBranches(null, [['e2', 'e4'], ['e7', 'e5']]);
    function handleSelected() {

    }
    render(<RepositoryView repository={repository} onSelected={handleSelected} />);
    const branch = screen.getByText(/E2/i);
    expect(branch).toBeInTheDocument();
});