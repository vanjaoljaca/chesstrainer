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
    
    function onTrainerChanged() {
        setDebug(s => trainer.isDone() ? 'done 🖕' : '...');
        setFen(s => trainer.fen());
        setArrows(s => trainer.arrows);
    }

    function onDrop(from, to) {
        console.log('on trop', trainer.isHumanMove());
        let result = trainer.tryMove(from, to);
        onTrainerChanged();
        if (!result) {
            return false;
        }
        setTimeout(() => {
            if(trainer.isDone()) {
                setDebug(() => 'nice 🎉');
                setTimeout(() => {
                    onPlayRandom();
                    onTrainerChanged();
                    setDebug(() => '...');
                }, 1000);
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
    
    function doComputerMove() {
        trainer.doComputerMove();
        onTrainerChanged();
    }

    return (
        <Container>
            <Row>
                <Col>
                    <button onClick={doComputerMove}>start</button>
                    <Chessboard
                        boardOrientation={trainer.orientation}
                        position={fen} onPieceDrop={onDrop}
                        customArrows={arrows}
                        boardWidth={350}
                    />
                    <p>🧠: {JSON.stringify(debug)}</p>
                </Col>
                <Col>
                    
                </Col>     
            </Row>
        </Container>);
}
