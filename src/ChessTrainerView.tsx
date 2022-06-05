import { useState } from "react";
import './App.css';
import { Chessboard } from "react-chessboard";
import { ChessTrainer } from './ChessTrainer'
import { Container, Row, Col } from 'react-bootstrap';
import { useProxyState } from "./useProxyState";

type TrainerViewProps = {
    trainer: ChessTrainer
}

export function ChessTrainerView({ trainer }: TrainerViewProps) {
    const DefaultDelay = 200
    const DefaultSlowDelay = 1500;
    const DoneDelay = 3000

    const [debug, setDebug] = useState(null);
    const [fen, setFen] = useState(() => trainer.fen());
    const [arrows, setArrows] = useState([]);
    const [orientation, onOrientationChanged] = useProxyState(() => trainer.orientation);
    const [hint, onHintChanged] = useProxyState(() => trainer.hint);
    const [name, onNameChanged] = useProxyState(() => trainer.currentBranch.name)

    function onTrainerChanged() {
        setDebug(s => trainer.isDone() ? 'done 🖕' : '...');
        setFen(s => trainer.fen());
        setArrows(s => trainer.arrows);
        onOrientationChanged()
        onHintChanged();
        onNameChanged();
    }

    function checkDone() {
        if (trainer.isDone()) {
            setDebug(() => 'nice 🎉');
            setTimeout(() => {
                onPlayRandom();
                onTrainerChanged();
                setDebug(() => '...');
            }, DoneDelay);
            return;
        }
    }

    function showWhatCouldHaveBeen() {
        // todo: toggle for this feature
        // todo: push this down into trainer?
        let altOptions = trainer.currentBranch.parent.branches
            .filter(b => b !== trainer.currentBranch)
            .map(b => [b.move.from, b.move.to])
        if(altOptions.length > 0) {
            setArrows(altOptions)
            setTimeout(() => setArrows([]), DefaultSlowDelay);
        }
    }

    function onDrop(from, to) {
        let result = trainer.tryMove(from, to);
        onTrainerChanged();
        if (!result) {
            return false;
        }
        showWhatCouldHaveBeen();
        
        setTimeout(() => {
            checkDone()
            if (trainer.isComputerMove()) {
                trainer.doComputerMove();
                onTrainerChanged();
                setTimeout(() => checkDone(), DefaultDelay);
            }
        }, DefaultDelay);
        return true;
    }

    function onPlayRandom() {
        trainer.playRandomLine();
        trainer.isComputerMove() && trainer.doComputerMove();
        onTrainerChanged();
    }

    function doComputerMove() {
        if(!trainer.isComputerMove()) return;
        trainer.doComputerMove();
        onTrainerChanged();
    }

    function onSwitch() {
        trainer.orientation = trainer.orientation === 'white' ? 'black' : 'white';
        onTrainerChanged();
    }

    function onReset() {
        trainer.reset();
        onTrainerChanged();
    }

    function onShowHint() {
        trainer.showHint();
        onTrainerChanged();
    }

    return (
        <Container>
            <Col>
                <Row>
                    <div style={{textAlign:'left'}}>
                        <button onClick={doComputerMove}>compute</button>
                        <button onClick={onSwitch}>♽</button>
                        <button onClick={onReset}>reset</button>
                    </div>
                </Row>
                <Row>
                    <Chessboard
                        boardOrientation={orientation}
                        position={fen} onPieceDrop={onDrop}
                        customArrows={arrows}
                        boardWidth={350}
                    />
                    <div style={{textAlign:'left'}}>
                        <div>🤴: {name}</div>
                        <div>🐛: {JSON.stringify(debug)}</div>
                        <div><span onClick={onShowHint}>🧠</span>: {hint}</div>
                    </div>
                </Row>
            </Col>
            <Col>

            </Col>
        </Container>);
}
