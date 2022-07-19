
import { ChessTrainer } from '../../app/ChessTrainer';
import { Repository } from '../../app/Repository';

test('tessssst', () => {
  let repository = new Repository()
  repository.createBranchesDebug([['e2', 'e4'], ['e7', 'e5']]);
  let trainer = new ChessTrainer(repository, 'white');
  let m = trainer.tryMove({ from: 'e2', to: 'e4' });
  let cm = trainer.doComputerMove();
  expect(m).toBeTruthy();
  expect(cm).toMatchObject({ move: { from: 'e7', to: 'e5' } });
})
