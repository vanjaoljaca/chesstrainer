import { useEffect, useState } from "react";
import './App.css';
import { Chessboard } from "react-chessboard";
import { ChessTrainerBuilder } from './ChessTrainerBuilder'
import { Container, Row, Col } from 'react-bootstrap';
import { RepositoryView } from "./RepositoryView";
import { Branch } from "./ChessTrainerShared";
import { useProxyState } from "./useProxyState";

type TrainerBuilderViewProps = {
    trainer: ChessTrainerBuilder
}

export function ChessTrainerBuilderView({ trainer }: TrainerBuilderViewProps) {
    // const [debug, setDebug] = useState(null);
    const [fen, setFen] = useState(() => trainer.fen);
    // const [currentMove, setCurrentMove] = useState(null)
    const [repository, setRepository] = useState(() => trainer.repository);
    const [currentBranch, setCurrentBranch] = useState(() => trainer.currentBranch);
    const [orientation, onOrientationChanged] = useProxyState(() => trainer.orientation);

    function onSaveBuild() {
        trainer.saveBuild();
        onTrainerChanged();
    }

    function onTrainerChanged() {
        setFen(s => trainer.fen);
        // setCurrentMove(s => trainer.currentBranch)
        setRepository(s => trainer.repository)
        onOrientationChanged();

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
        trainer.currentBranch = b;
        onTrainerChanged();
    }

    function onSwitch() {
        trainer.orientation = trainer.orientation == 'white' ? 'black' : 'white';
        onTrainerChanged();
    }

    function onReset() {
        trainer.reset();
        onTrainerChanged();
    }

    return (
        <Container>
            <Row>
                <Col>
                    <button onClick={onReset}>reset</button>
                    <button onClick={onBack}>back</button>
                    <button onClick={onDelete}>delete</button>
                    <button onClick={onSaveBuild}>save build</button>
                    <button onClick={onSwitch}>♽</button>
                    <button onClick={() => onTrainerChanged()}>refresh</button>
                    <Chessboard
                        boardOrientation={trainer.orientation}
                        position={fen} onPieceDrop={onDrop}
                        boardWidth={350}
                    />

                    {/* <p>🧠: {JSON.stringify(debug)}~</p> */}
                </Col>
                <Col>
                    <BranchEditView branch={currentBranch} onSave={() => {}}/>
                    <RepositoryView 
                        repository={repository}
                        onSelected={onSelected}/>
                </Col>
            </Row>
        </Container>);

}

function BranchEditView({ branch, onSave }: { branch: Branch, onSave: () => void }) {

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
            <div>name: <input type='text' onChange={e => setName(e.target.value)} value={name} /></div>
            <div>comment: <input type='text' onChange={e => setComment(e.target.value)} value={comment} /></div>
            <button onClick={handleSave}>save</button>
        </div>
    );
}
