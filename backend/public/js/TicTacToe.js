// noinspection JSUnresolvedFunction

// import Player from './Player';

const socket = io();

class GameState {
    static PLAYING = 0;
    static GAME_OVER = 1;
    static IDLE = 2;
}

const texture = {
    o: "images/circle.png",
    x: "images/cross.png",
};

// noinspection JSUnusedGlobalSymbols
class TicTacToe {
    constructor() {
        this.player = 'x';
        this.cells = [];
        this.blankCells = 9;
        this.state = GameState.IDLE;
    }
}

let tictactoe = new TicTacToe();
let clientPlayer;

function joinGame() {
    let invite = document.querySelector('#invite').value;
    if (invite.length === 0) return;
    socket.emit('join game', invite, result => {
        const { err, player } = result;
        if (!err) {
            document.querySelector('.login').style.display = 'none';
            document.querySelector('.Game').style.display = 'flex';
            document.querySelector('.waiting').style.display = 'flex';
            document.querySelector('.inviteCode').innerHTML = invite;
            document.querySelector('#playerImg').src = texture[player];
            const opponent = player === 'x'? 'o': 'x';
            document.querySelector('#opponentImg').src = texture[opponent];
            clientPlayer = player;
            if (player === 'o') {
                document.querySelector('.waiting').style.display = 'none';
                socket.emit('start game');
                tictactoe.state = GameState.PLAYING;
            }
        } else {
            document.querySelector('.error').style.display = 'block';
        }
    });
}

socket.on('start game', () => {
    document.querySelector('.waiting').style.display = 'none';
    tictactoe.state = GameState.PLAYING;
});

socket.on('leave', () => {
    reset();
    tictactoe.state = GameState.IDLE;
    clientPlayer = 'x';
    document.querySelector('#playerImg').src = texture[clientPlayer];
    const opponent = clientPlayer === 'x'? 'o': 'x';
    document.querySelector('#opponentImg').src = texture[opponent];
    document.querySelector('.waiting-message').innerHTML = 'opponent left. waiting for opponent to join...'
    document.querySelector('.waiting').style.display = 'flex';
});

socket.on('play', index => {
    play(index);
});

function emitIndex(index) {
    if (clientPlayer === tictactoe.player && tictactoe.cells[index] === undefined && tictactoe.state === GameState.PLAYING) {
        socket.emit('play', index);
        play(index);
    }
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

socket.on('reset', () => {
    reset();
});

function emitReset() {
    socket.emit('reset');
    reset();
}

function reset() {
    tictactoe = new TicTacToe();
    tictactoe.state = GameState.PLAYING;
    document.querySelector("#winnerWindow").style.display = "none";
    document.querySelector("#drawWindow").style.display = "none";
    for (let i = 0; i < 9; i++) {
        document.querySelector(`#cell${i}`).src = "images/blank.png";
    }
}