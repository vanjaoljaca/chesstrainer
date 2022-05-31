import { useState } from "react";
import './App.css';
import { Chessboard } from "react-chessboard";
import { ChessTrainer } from './ChessTrainer'
import { Container, Row, Col } from 'react-bootstrap';

type TrainerViewProps = {
    trainer: ChessTrainer
}

export function ChessTrainerView({ trainer }: TrainerViewProps) {
    const [debug, setDebug] = useState(null);
    const [fen, setFen] = useState(() => trainer.fen());
    const [arrows, setArrows] = useState([]);
    const [currentMove, setCurrentMove] = useState(null)
    const [repository, setRepository] = useState(null);
    const [done, setDone] = useState(() => trainer.isDone());

    function onReloadRepository() {
        trainer.loadRepository();
        onTrainerChanged();
    }

    function onTrainerChanged() {
        setDebug(s => trainer.isDone() ? 'done 🖕' : '...');
        setFen(s => trainer.fen());
        setArrows(s => trainer.arrows);
        setCurrentMove(s => trainer.currentBranch)
        setRepository(s => trainer.repository)
        setDone(s => trainer.isDone())
    }

    function onDrop(from, to) {
        let result = trainer.tryMove(from, to);
        onTrainerChanged();
        if (!result) {
            return false;
        }
        setTimeout(() => {
            if(trainer.isDone()) {
                onPlayRandom();
                onTrainerChanged();
                return;
            }
            if(trainer.isComputerMove()) trainer.doComputerMove();
            onTrainerChanged();
        }, 200);
        return true;
    }

    function onPlayRandom() {
        trainer.playRandomLine();
        trainer.isComputerMove() && trainer.doComputerMove();
        onTrainerChanged();
    }

    function onTest() {

    }

    function doComputerMove() {
        trainer.doComputerMove();
        onTrainerChanged();
    }

    return (
        <Container>
            <Row>
                <Col>
                    <button onClick={() => trainer.reset()}>reset</button>
                    <button onClick={onTest}>test</button>
                    <button onClick={doComputerMove}>computer</button>
                    <button onClick={onPlayRandom}>play random</button>
                    <button onClick={() => onTrainerChanged()}>refresh</button>
                    <button onClick={() => onReloadRepository()}>reload repo</button>
                    <Chessboard
                        boardOrientation={trainer.orientation}
                        position={fen} onPieceDrop={onDrop}
                        customArrows={arrows}
                    />

                    <p>🧠: {JSON.stringify(debug)}~</p>
                </Col>
                <Col>
                    
                </Col>
                
            </Row>
        </Container>);
}
