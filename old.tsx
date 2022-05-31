
function PlayRandomMoveEngine() {
    const [moves, setMoves] = useState([]);
    const [game, setGame] = useState(new Chess());
    const [savedMoves, setSavedMoves] = useState(null);
    const [building, setBuilding] = useState(true)
    const [playbackIndex, setPlaybackIndex] = useState(0);
    const [customArrows, setCustomArrows] = useState([]);
    const [state, setState] = useState({});
    const [trainer, setTrainer] = useState(CaroCannTrainer());
  
    function test() {
      console.log('start moves', moves, moves.length);
      setMoves(m => {
        return [...m, {
          "color": "w",
          "from": "e2",
          "to": "e4",
          "flags": "b",
          "piece": "p",
          "san": "e4"
        }];
      })
      console.log('test moves', moves, moves.length);
      setCustomArrows(s => [['a3', 'a5']]);
    }
  
    function safeGameMutate(modify: (ChessInstance) => void) {
      setGame((g) => {
        const update = { ...g };
        modify(update);
        return update;
      });
    }
  
    function makeRandomMove() {
      const possibleMoves = game.moves();
      if (game.game_over() || game.in_draw() || possibleMoves.length === 0)
        return; // exit if the game is over
      const randomIndex = Math.floor(Math.random() * possibleMoves.length);
      var move;
      safeGameMutate((game) => {
        move = game.move(possibleMoves[randomIndex]);
      });
      setMoves(m => [...m, move]);
    }
  
    function onDropBuild(sourceSquare, targetSquare) {
      let move = null;
      safeGameMutate(game => {
        move = game.move({
          from: sourceSquare,
          to: targetSquare,
          promotion: "q", // always promote to a queen for example simplicity
        });
      });
      if (move === null) return false; // illegal move
      setMoves(m => [...m, move]);
  
      setTimeout(makeRandomMove, 200);
      return true;
    }
  
    function onDropPlay(sourceSquare, targetSquare) {
  
      let expectedMove = savedMoves[playbackIndex];
      console.log(expectedMove, targetSquare, sourceSquare);
      if (expectedMove.to == targetSquare && expectedMove.from == sourceSquare) {
        console.log('good');
      } else {
        setCustomArrows(s => [[expectedMove.from, expectedMove.to]]);
        // safeGameMutate(g => g.undo());
        console.log('bad.')
        return;
      }
      // if this is the wrong move
      // draw arrow
      // timeout 200 undo moves
  
      // if this is right move
      // clear all arrows
      // timeout 200 computer move
  
      var move;
      setTimeout(() => {
        safeGameMutate((game: ChessInstance) => {
          move = game.move({
            from: sourceSquare,
            to: targetSquare,
            promotion: "q", // always promote to a queen for example simplicity
          });
          // if move == false
          move = game.move(savedMoves[playbackIndex + 1]);
          setPlaybackIndex(playbackIndex + 2);
        });
      }, 200);
      return true;
    }
  
    function onSaveMoves() {
      console.log('moves', moves);
      setSavedMoves(moves);
      safeGameMutate(g => {
        g.reset();
      });
      setBuilding(false);
    }
  
    function onBuild() {
      setBuilding(true);
    }
  
    if (building) {
      return (<div>
        <button onClick={test}>test</button>
        <Chessboard position={game.fen()} onPieceDrop={onDropBuild}
          customArrows={customArrows} />
        <button onClick={onSaveMoves}>save moves</button>
      </div>);
    } else {
      return (<div>
        <button onClick={test}>test</button>
        <Chessboard position={game.fen()} onPieceDrop={onDropPlay}
          customArrows={customArrows} />
        <button onClick={onBuild}>Build</button>
      </div>);
    }
  }
  


class CaroCannTrainer extends ChessTrainer {
  
  static DefaultRepository: Branch[] = [

    branch(move('e2', 'e4'),
      branch(move('c7', 'c6'),
        branch(move('d2', 'd4'),
          branch(move('e7', 'e5'))
        )
      )
    )

  ];

  static DefaultLine: Branch[] = [
    CaroCannTrainer.DefaultRepository[0],
    CaroCannTrainer.DefaultRepository[0].branches[0],
    CaroCannTrainer.DefaultRepository[0].branches[0].branches[0],
    CaroCannTrainer.DefaultRepository[0].branches[0].branches[0].branches[0],
  ]

  constructor(orientation?: Orientation) {
    super(CaroCannTrainer.DefaultRepository, orientation)
    this.line = CaroCannTrainer.DefaultLine
  }
}


class CaroCannTrainerOriginal {
  readonly game: ChessInstance;

  static DefaultRepository: Branch[] = [

    branch(move('e2', 'e4'),
      branch(move('c7', 'c6'),
        branch(move('d2', 'd4'),
          branch(move('e7', 'e5'))
        )
      )
    )

  ];

  static DefaultLine: Branch[] = [
    CaroCannTrainer.DefaultRepository[0],
    CaroCannTrainer.DefaultRepository[0].branches[0],
    CaroCannTrainer.DefaultRepository[0].branches[0].branches[0],
    CaroCannTrainer.DefaultRepository[0].branches[0].branches[0].branches[0],
  ]

  repository: Branch[] = CaroCannTrainer.DefaultRepository
  line: Branch[] = CaroCannTrainer.DefaultLine;
  current: number = 0
  currentMove: Branch = null
  end: boolean = false
  orientation: Orientation = 'black'
  building: boolean = true
  arrows: [[any, any]?] = []
  buildLine: ShortMove[] = []

  constructor(orientation?: Orientation) {
    this.game = new Chess();
    this.orientation = orientation;
    if (!this.building) {
      this.doComputerMove();
    }
  }

  tryMove(from: string, to: string) {
    if (!this.isHumanMove())
      throw 'Not human move.'

    if (this.line.length <= this.current) {
      return null;
    }
    let nextBranch = this.line[this.current];
    let nextMove = nextBranch.move;
    if (nextMove.from == from && nextMove.to == to) {
      this.current += 1;
    } else {
      this.arrows = [[nextMove.from, nextMove.to]];
      return null;
    }
    this.game.move(nextMove)
  }

  doComputerMove() {
    if (!this.isComputerMove())
      throw 'Not computer move.'

    let nextBranch = this.line[this.current++]
    let nextMove = nextBranch.move;
    this.game.move(nextMove);
    this.end = this.line.length >= this.current;
    return this.line[this.current - 1]; // computer move
  }

  addToLine(from, to) {
    this.game.move({ from, to })
    this.buildLine.push({ from, to });
  }

  testLine() {
    if (this.building) {
      var currentBranches = this.repository;
      var current = null;
      this.line = []
      for (let move of this.buildLine) {
        var next = currentBranches.find(b => moveEquals(b.move, move));
        if (next == null) {
          next = branch(move);
          currentBranches.push(next);
        }
        currentBranches = next.branches
        current = next.move;
        this.line.push(next);
      }
      this.buildLine = [];
      this.building = false;
    }

    this.current = 0;
    this.game.reset();
    if (this.isComputerMove()) {
      this.doComputerMove();
    }
  }

  fen() {
    return this.game.fen();
  }

  isComputerMove() {
    return !this.isHumanMove();
  }

  isHumanMove() {
    if (this.orientation == 'white')
      return this.current % 2 == 0;
    return this.current % 2 == 1;
  }
}
