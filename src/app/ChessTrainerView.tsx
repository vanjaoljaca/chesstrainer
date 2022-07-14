import { useEffect, useState } from "react";
import './App.css';
import { Chessboard, Square } from "react-chessboard";
import { ChessTrainer } from './ChessTrainer'
import { Container, Row, Col, NavDropdown } from 'react-bootstrap';
import { useProxyState } from "../util/useProxyState";
import ToggleButton from 'react-toggle-button'

type TrainerViewProps = {
    trainer: ChessTrainer
}

export function ChessTrainerView({ trainer }: TrainerViewProps) {
    const DefaultDelay = 200
    const DefaultSlowDelay = 1500;
    const DoneDelay = 3000
    const MaxErrors = 3;

    const AltOptionArrowColor = 'Silver'
    const MistakeArrowColor = 'SandyBrown'

    const [debug, setDebug] = useState('');
    const [fen, setFen] = useState<string>(() => trainer.fen());
    const [arrows, setArrows] = useState<[Square, Square][]>([]);
    const [arrowColor, setArrowColor] = useState(MistakeArrowColor);
    const [orientation, onOrientationChanged] = useProxyState(() => trainer.orientation);
    const [hint, onHintChanged] = useProxyState(() => trainer.hint);
    const [name, onNameChanged] = useProxyState(() => trainer.currentBranch.name)
    const [trainPast, setTrainPast] = useState(false)
    const [autoCompute, setAutoCompute] = useState(true)
    const [showOptions, setShowOptions] = useState(false)
    const [errorCount, setErrorCount] = useState(0);

    useEffect(() => {
        if (!trainer) return;
        if (trainer.isComputerMove())
            trainer.doComputerMove();
        onTrainerChanged();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [trainer, trainer.orientation]);

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
        if (!trainPast) return;
        // todo: toggle for this feature
        // todo: push this down into trainer?
        if (trainer.currentBranch.parent === undefined) return;
        let altOptions: [Square, Square][] = trainer.currentBranch.parent.branches
            .filter(b => b !== trainer.currentBranch)
            .map(b => [b.move.from, b.move.to])
        if (altOptions.length > 0) {
            setArrows(altOptions)
            setArrowColor(AltOptionArrowColor)
            setTimeout(() => {
                setArrows([])
                setArrowColor(MistakeArrowColor)
            }, DefaultSlowDelay);
        }
    }

    function onDrop(from, to, _piece): boolean {
        let result;
        try {
            result = trainer.tryMove({ from, to });
        } catch (e) {
            setDebug(e as string)
            return false;;
        }

        onTrainerChanged();
        if (!result) {
            if (errorCount >= MaxErrors) {
                setErrorCount(0);
                setDebug('Too many mistakes. Resetting.')
                setTimeout(() => onReset(), DefaultSlowDelay);
                return false;
            }
            setErrorCount(c => c + 1)
            return false;
        }
        showWhatCouldHaveBeen();

        setTimeout(() => {
            checkDone()
            if (!autoCompute) return;
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
        if (!trainer.isComputerMove()) return;
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

    function onBack() {
        if (trainer.currentBranch.parent)
            trainer.currentBranch = trainer.currentBranch.parent;
        if (trainer.currentBranch.parent)
            trainer.currentBranch = trainer.currentBranch.parent;
        onTrainerChanged()
    }

    function Menu() {
        return (
            <NavDropdown title="↕️🧵" id="navbarScrollingDropdown">
                <NavDropdown.Item onClick={onBack}>back</NavDropdown.Item>
                <NavDropdown.Item onClick={doComputerMove}>compute</NavDropdown.Item>
                <NavDropdown.Item onClick={onSwitch}>switch sides</NavDropdown.Item>
                <NavDropdown.Item onClick={onReset}>reset</NavDropdown.Item>
                <NavDropdown.Item onClick={() => setShowOptions(v => !v)}>options</NavDropdown.Item>
            </NavDropdown>
        );
    }

    function MenuOptions() {
        return (
            <Row>
                {showOptions &&
                    <div style={{ textAlign: 'left' }}>
                        Options:
                        train past:
                        <ToggleButton
                            value={trainPast}
                            onToggle={() => setTrainPast(v => !v)} />
                        autocompute: <ToggleButton
                            value={autoCompute}
                            onToggle={() => setAutoCompute(v => !v)} />
                    </div>
                }
            </Row>
        )
    }

    return (
        <Container>
            <Col>
                <Row>
                    <Chessboard
                        boardOrientation={orientation}
                        position={fen} onPieceDrop={onDrop}
                        customArrows={arrows}
                        boardWidth={350}
                        customArrowColor={arrowColor}
                    />
                    <div style={{ textAlign: 'left' }}>
                        <div>🤴: {name}</div>
                        <div>🐛: {JSON.stringify(debug)}</div>
                        <div><span onClick={onShowHint}>🧠</span>: {hint}</div>
                    </div>
                    <Menu />
                    <MenuOptions />
                </Row>
            </Col>
        </Container>)
        ;
}
