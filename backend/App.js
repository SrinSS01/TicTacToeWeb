// noinspection JSUnresolvedVariable

const express = require('express');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5000;
const io = new Server(server);

app.use(express.static(__dirname + '/public'));
app.use(cors());

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.get('/create', (req, res) => {
    const invite = req.query.invite;
    if (!invite) {
        res.send('No invite');
    } else {
        res.sendFile(path.join(__dirname, 'public', 'TicTacToe.html'));
        io.on("connection", socket => {
            console.log(`connected to ${ invite }`);
            socket.join(invite);
            socket.on('play', index => {
                socket.to(invite).emit('play', index);
            });
        });
    }
})

server.listen(PORT, () => console.log(`listening to port: ${ PORT }`));