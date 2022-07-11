// noinspection JSUnresolvedFunction

const socket = io();

const GameState = {
    PLAYING: 0,
    GAME_OVER: 1
};

const texture = {
    o: "images/circle.png",
    x: "images/cross.png",
};

class TicTacToe {
    constructor() {
        this.player = 'x';
        this.cells= [];
        this.blankCells = 9;
        this.state = GameState.PLAYING;
    }
}

let tictactoe = new TicTacToe();

socket.on('play', index => {
    play(index);
});

function emitIndex(index) {
    socket.emit('play', index);
}

function play(index) {
    if (tictactoe.cells[index] === undefined && tictactoe.state === GameState.PLAYING) {
        document.querySelector(`#cell${index}`).src = texture[tictactoe.player];
        tictactoe.cells[index] = tictactoe.player;
        tictactoe.blankCells--;
        const result = checkWinner();
        if (result > 0) {
            document.querySelector("#winner").src = texture[tictactoe.player];
            document.querySelector("#winnerWindow").style.display = "grid";
            tictactoe.state = GameState.GAME_OVER;
            return;
        }
        if (tictactoe.blankCells === 0) {
            document.querySelector("#drawWindow").style.display = "grid";
            tictactoe.state = GameState.GAME_OVER;
            return;
        }
        tictactoe.player = tictactoe.player === 'x'? 'o': 'x';
    }
}

function checkWinner() {
    let result = tictactoe.blankCells > 0? 0: -1;
    if (tictactoe.cells[0] === tictactoe.player && tictactoe.cells[0] === tictactoe.cells[4] && tictactoe.cells[0] === tictactoe.cells[8]) return result + 2;
    if (tictactoe.cells[2] === tictactoe.player && tictactoe.cells[2] === tictactoe.cells[4] && tictactoe.cells[2] === tictactoe.cells[6]) return result + 2;
    for (let i = 0; i < 3; i++) {
        const rowIndex = i * 3;
        if (tictactoe.cells[rowIndex] === tictactoe.player && tictactoe.cells[rowIndex] === tictactoe.cells[rowIndex + 1] && tictactoe.cells[rowIndex] === tictactoe.cells[rowIndex + 2]) return result + 2;
    }
    for (let j = 0; j < 3; j++) {
        if (tictactoe.cells[j] === tictactoe.player && tictactoe.cells[j] === tictactoe.cells[3 + j] && tictactoe.cells[j] === tictactoe.cells[6 + j]) return result + 2;
    }
    return 0;
}

function reset() {
    tictactoe = new TicTacToe();
    document.querySelector("#winnerWindow").style.display = "none";
    document.querySelector("#drawWindow").style.display = "none";
    for (let i = 0; i < 9; i++) {
        document.querySelector(`#cell${i}`).src = "images/blank.png";
    }
}

window.onbeforeunload = () => "Data will be lost if you leave the page, are you sure?";