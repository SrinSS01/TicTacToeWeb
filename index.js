// noinspection JSUnresolvedVariable

const express = require('express');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 500;
const io = new Server(server);

app.use(express.static(__dirname + '/public'));
app.use(cors());

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'TicTacToe.html'));
});

io.on("connection", socket => {
    let invite;
    socket.on('join game', (inv, callback) => {
        invite = inv;
        socket.join(inv);
        io.in(invite).fetchSockets().then(sockets => {
            const length = sockets.length;
            switch (length) {
                case 1: {
                    callback({
                        err: false,
                        player: 'x'
                    });
                } break;
                case 2: {
                    callback({
                        err: false,
                        player: 'o'
                    });
                } break;
                default: {
                    callback({
                        err: true,
                        player: undefined
                    });
                    socket.leave(inv);
                }
            }
        });
    });
    socket.on('play', (index) => socket.to(invite).emit('play', index));
    socket.on('reset', () => socket.to(invite).emit('reset'));
    socket.on('start game', () => {
        socket.to(invite).emit('start game');
    });
    socket.on('disconnect', () => {
        socket.to(invite).emit('leave');
    });
});

server.listen(PORT, () => console.log(`listening to port: ${ PORT }`));