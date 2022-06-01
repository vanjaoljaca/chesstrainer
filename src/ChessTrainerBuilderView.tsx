import { useEffect, useState } from "react";
import './App.css';
import { Chessboard } from "react-chessboard";
import { ChessTrainerBuilder } from './ChessTrainerBuilder'
import { Container, Row, Col } from 'react-bootstrap';
import { RepositoryView } from "./RepositoryView";
import { Branch } from "./ChessTrainerShared";

type TrainerBuilderViewProps = {
    trainer: ChessTrainerBuilder
}

export function ChessTrainerBuilderView({ trainer }: TrainerBuilderViewProps) {
    // const [debug, setDebug] = useState(null);
    const [fen, setFen] = useState(() => trainer.fen);
    // const [currentMove, setCurrentMove] = useState(null)
    const [repository, setRepository] = useState(() => trainer.repository);
    const [currentBranch, setCurrentBranch] = useState(() => trainer.currentBranch);

    function onSaveBuild() {
        trainer.saveBuild();
        onTrainerChanged();
    }

    function onTrainerChanged() {
        setFen(s => trainer.fen);
        // setCurrentMove(s => trainer.currentBranch)
        setRepository(s => trainer.repository)
    }

    function onDrop(from, to) {
        let result = trainer.tryMove(from, to);
        onTrainerChanged();
        if (!result) {
            return false;
        }
        return true;
    }

    function onBack() {
        if('parent' in trainer.currentBranch)
            trainer.currentBranch = trainer.currentBranch.parent;
            onTrainerChanged()
    }

    function onDelete() {
        if('parent' in trainer.currentBranch) {
            trainer.delete(trainer.currentBranch);
        }
        onTrainerChanged()
    }

    function onSelected(b: Branch) {
        setCurrentBranch(b);
        trainer.loadBranch(b);
        onTrainerChanged();
    }

    return (
        <Container>
            <Row>
                <Col>
                    <button onClick={() => trainer.reset()}>reset</button>
                    <button onClick={onBack}>back</button>
                    <button onClick={onDelete}>delete</button>
                    <button onClick={onSaveBuild}>save build</button>
                    <button onClick={() => onTrainerChanged()}>refresh</button>
                    <Chessboard
                        boardOrientation={trainer.orientation}
                        position={fen} onPieceDrop={onDrop}
                        boardWidth={350}
                    />

                    {/* <p>🧠: {JSON.stringify(debug)}~</p> */}
                </Col>
                <Col>
                    <BranchView branch={currentBranch} onSave={() => {}}/>
                    <RepositoryView 
                        repository={repository}
                        onSelected={onSelected}/>
                </Col>
            </Row>
        </Container>);

}

function BranchView({ branch, onSave }: { branch: Branch, onSave: () => void }) {

    const [name, setName] = useState(() => branch.name);
    const [comment, setComment] = useState(() => branch.comment);

    useEffect(() => {
        setName(branch.name || '');
        setComment(branch.comment || '');
    }, [branch]);


    function onNameChanged(e) {

    }

    function onCommentChanged(e) {

    }

    function handleSave() {
        console.log(name, comment);
        branch.name = name;
        branch.comment = comment;
    }

    let move = 'move' in branch ? branch.move.from + ' -> ' + branch.move.to : 'root';
    return (
        <div>
            <p>{move}</p>
            <input type='text' onChange={e => setName(e.target.value)} value={name} />
            <input type='text' onChange={e => setComment(e.target.value)} value={comment} />
            <button onClick={handleSave}>save</button>
        </div>
    );
}
