export class Repository {

    // static readonly REPOSITORY_KEY = 'REPOSITORY2';
    // persistRepository() {
    //     this.deparentify(this.repository.branches);
    //     localStorage.setItem(ChessTrainer.REPOSITORY_KEY, JSON.stringify(this.repository));
    //     this.parentify(null, this.repository.branches)
    // }

    // loadRepository() {
    //     let json = localStorage.getItem(ChessTrainer.REPOSITORY_KEY);
    //     let parsed = JSON.parse(json);
    //     let repository: RootBranch = parsed ? parsed : { branches: [], name: 'root' }
    //     this.parentify(undefined, repository.branches)
    //     this.loadFen(repository.branches)
    //     console.log('Loaded repository:', this.repository)
    //     return repository
    // }

    // deparentify(branches: MoveBranch[]) {
    //     for (let branch of branches) {
    //         branch.parent = undefined;
    //         this.deparentify(branch.branches);
    //     }
    // }

    // parentify(parent: any, branches: MoveBranch[]) {
    //     for (let branch of branches) {
    //         branch.parent = parent;
    //         this.parentify(branch, branch.branches);
    //     }
    // }

    // loadFen(repository: MoveRepository) {
    //     let result = new Map<Fen, Branch[]>();
    //     let game = new Chess()
    //     let dfs = (branches) => {
    //         let fen = game.fen();
    //         let fenBranches = result.get(fen) || []
    //         result[fen] = fenBranches;
    //         for (let branch of branches) {
    //             fenBranches.push(branch);
    //             game.move(branch.move);
    //             dfs(branch.branches);
    //             game.undo();
    //         }
    //     }
    //     dfs(repository);
    //     this.branchesFromFen = result;
    // }

}