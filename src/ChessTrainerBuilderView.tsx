import { useState } from "react";
import './App.css';
import { Chessboard } from "react-chessboard";
import { ChessTrainerBuilder } from './ChessTrainerBuilder'
import { Container, Row, Col } from 'react-bootstrap';
import { RepositoryView } from "./RepositoryView";

type TrainerBuilderViewProps = {
    trainer: ChessTrainerBuilder
}

export function ChessTrainerBuilderView({ trainer }: TrainerBuilderViewProps) {
    const [debug, setDebug] = useState(null);
    const [fen, setFen] = useState(() => trainer.fen());
    const [currentMove, setCurrentMove] = useState(null)
    const [repository, setRepository] = useState(null);

    function onSaveBuild() {
        trainer.saveBuild();
        trainer.persistRepository();
        onTrainerChanged();
    }

    function onSave() {
        trainer.persistRepository();
    }

    function onTrainerChanged() {
        setFen(s => trainer.fen());
        setCurrentMove(s => trainer.currentBranch)
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

    function onTest() {

    }

    function onSelected(b) {
        trainer.loadBranch(b);
        onTrainerChanged();
    }

    function onCreateRequested() {

    }

    return (
        <Container>
            <Row>
                <Col>
                    <button onClick={() => trainer.reset()}>reset</button>
                    <button onClick={onTest}>test</button>
                    <button onClick={onSaveBuild}>save build</button>
                    <button onClick={onSave}>save repo</button>
                    <button onClick={() => trainer.clearRepository()}>clear repo</button>
                    <button onClick={() => onTrainerChanged()}>refresh</button>
                    <Chessboard
                        boardOrientation={trainer.orientation}
                        position={fen} onPieceDrop={onDrop}
                        boardWidth={350}
                    />

                    <p>🧠: {JSON.stringify(debug)}~</p>
                </Col>
                <Col>
                    <button onClick={onCreateRequested}>create</button>
                    <RepositoryView 
                        repository={repository}
                        onSelected={onSelected}/>
                </Col>
            </Row>
        </Container>);

}
