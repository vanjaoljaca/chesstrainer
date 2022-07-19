
import { ChessTrainerBuilder } from '../../app/ChessTrainerBuilder';
import { Repository } from '../../app/Repository';

test('fffff', () => {
  let repository = new Repository()
  // repository.createBranchesDebug([['e2', 'e4'], ['e7', 'e5']]);
  let trainer = new ChessTrainerBuilder(repository, 'white');
  let m = trainer.tryMove({ from: 'e2', to: 'e4' });

  expect(m).toBeTruthy();

  let m2 = trainer.tryMove('e5');
  expect(m2).toBeTruthy();

  let m3 = trainer.tryMove('ex4');
  expect(m3).not.toBeTruthy(); //?
})
