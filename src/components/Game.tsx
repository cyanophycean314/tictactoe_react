import * as React from 'react';

interface squareprops {
    onClick(): void,
    dank: string
}

class Square extends React.Component<squareprops, null> {
    render() {
        return (
            <button className="square" onClick={() => {console.log(this.props.dank); this.props.onClick()}}>
                {this.props.dank}
            </button>
        );        
    }
}

interface boardprops {
    N: number,
    squares: string[],
    onClick(i: number): void
}

class Board extends React.Component<boardprops, null> {
    renderSquare(i: number) {
        console.log(this.props.squares)
        return (
            <Square
                key={i}
                dank={this.props.squares[i]}
                onClick={()=>this.props.onClick(i)}
            />
        );
    }

    render() {
        interface rowprops {
            start: number,
            N: number,
        }

        const BoardRow = (props : rowprops) => {
            let rowsquares : JSX.Element[] = [];
            for (let i = 0; i < props.N; i++) {
                rowsquares.push(this.renderSquare(i + props.start))
            }
            console.log(rowsquares);
            return (<div className="board-row">
                {rowsquares}
                </div>
            );
        }

        let board : JSX.Element[] = [];
        for (let i = 0; i < this.props.N; i++) {
            board.push(
                <BoardRow key={i * this.props.N}
                    N={this.props.N}
                    start={i * this.props.N}  />)
        }
        return <div>{board}</div>
    }
}

let N = 3;
interface boardpieces{
    squares: string[]
}
interface gamestate {
    history: boardpieces[],
    stepNumber: number,
    xIsNext: boolean
}

class Game extends React.Component<null, gamestate> {
    constructor() {
        super();
        let N : number = 3;
        let emptysquares : string [] = [];
        for (let i = 0; i < N*N; i++) { emptysquares.push(null); }
        this.state = {
            history: [{
                squares: emptysquares
            }],
            stepNumber : 0,
            xIsNext : true
        };
        console.log(this.state.history)
    }

    handleClick(i: number) {
        const history : boardpieces[] = this.state.history.slice(0, this.state.stepNumber + 1);
        const current : boardpieces = history[history.length - 1];
        const squares : string[] = current.squares.slice();
        if (calculateWinner(squares) || squares[i]) {
            return;
        }
        squares[i] = this.state.xIsNext ? 'X' : 'O';
        this.setState({
            history: history.concat([{
                squares: squares
            }]),
            stepNumber: history.length,
            xIsNext: !this.state.xIsNext,
        })
    }

    jumpTo(step: number) {
        this.setState({
            stepNumber: step,
            xIsNext: (step % 2) ? false : true,
        })
    }

    render() {
        const history : boardpieces[] = this.state.history;
        const current : boardpieces = history[this.state.stepNumber];
        console.log('CURRENT');
        console.log(history, current);
        const status : string = getStatus(current.squares, this.state.xIsNext);

        const moves : JSX.Element[] = history.map((step: boardpieces, move: number) => {
            let desc : JSX.Element;
            if (move == 0) {
                desc = <p>Game Start</p>;
            } else if (move === this.state.stepNumber) {
                desc = <b>Move #{move}</b>;
            } else {
                desc = <p>Move #{move}</p>;
            }
            return (
                <li key={move}>
                    <a href="#" onClick={()=>this.jumpTo(move)}>{desc}</a>
                </li>
            );
        })

        return (
            <div className="game">
                <div className="game-board">
                    <Board
                        N={N}
                        squares={current.squares}
                        onClick={(i) => this.handleClick(i)}
                    />
                </div>
                <div className="game-info">
                    <div> {status} </div>
                    <ol> {moves} </ol>
                </div>
            </div>
        );
    }
}

function calculateWinner(squares: string[]) : string {
    //Check rows and columns, i is row/col number, j are entries along that
    for (let i = 0; i < N; i++) {
        let x0 : string = squares[i*N];
        for (let j = 1; x0 && j < N; j++) {
            if (squares[i*N + j] !== squares[i*N + j-1]) {
                x0 = null;
            }
        }
        if (x0)
            return x0;
        let y0: string = squares[i];
        for (let j = 1; y0 && j < N; j++) {
            if (squares[i+N*j] !== squares[i+N*(j-1)]) {
                y0 = null;
            }
        }
        if (y0)
            return y0;
    }

    let diagl0 : string = squares[0], diagr0 : string = squares[N-1];
    for (let i = 1; (diagl0 || diagr0) && i < N; i++) {
        if (squares[i+N*i] !== squares[i+N*(i-1)]) {
            diagl0 = null;
        }
        if (squares[(N-i-1) + N*i] !== squares[(N-i) + N*(i-1)]) {
            diagr0 = null;
        }
    }
    if (diagl0 || diagr0) {
        return diagl0 || diagr0;
    }
    if (squares.indexOf(null) == -1) {
        return "tie";
    }
    return null;
}

function getStatus(squares: string[], xIsNext: boolean) : string {
    let winner : string = calculateWinner(squares);
    if (winner) {
        return `Winner: ${winner}`;
    } else {
        if (squares.indexOf(null) == -1) {
            return `Tie Game`;
        } else {
            return 'Next player: ' + (xIsNext ? 'X' : 'O');
        }
    }
}

export {Game}