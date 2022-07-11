const io = require('socket.io')();
const { initGame, gameLoop, getUpdatedVelocity } = require('./game.js');
const { frameRate } = require('./constants.js');
const { makeid } = require('./utils.js');

const state = {}; // roomName : state,
const clientRooms = {}; // client.id : roomName,

io.on('connection', client => {
    // client.emit('init', {data: 'hello world'});
    //Key press
    client.on('keydown', (keyCode) => {
        const roomName = clientRooms[client.id];

        if(!roomName) return;

        try{
            keyCode = parseInt(keyCode);
        } catch(e){
            console.error(e);
            return;
        }

        const vel = getUpdatedVelocity(keyCode);
        if(vel){
            // don't allow snake to bite itself by going 'back'
            if(state[roomName]){
                let playerVel = state[roomName].players[client.number - 1].vel;

                if(playerVel.x != (-1*vel.x) || playerVel.y != (-1*vel.y))
                state[roomName].players[client.number - 1].vel = vel;
            }
        }
    });

    client.on('newGame', (snakeColor) => {
        let roomName = makeid(5);
        clientRooms[client.id] = roomName;
        client.emit('gameCode', roomName);

        state[roomName] = initGame();
        state[roomName].players[0].color = snakeColor;

        client.join(roomName);
        client.number = 1;
        client.emit('init', 1);
    });

    client.on('joinGame', (colorCode) => {
        // game needs to exist, and another player must be waiting for us.
        // const room = io.sockets.adapter.rooms[gameCode];
        const room = io.sockets.adapter.rooms.get(colorCode.Code);
        client.emit('gameCode', colorCode.Code);
        let allUsers;
        if(room){
            // allUsers = room.sockets;
            allUsers =  room.size;
        }

        let numClients = 0;
        if(allUsers){
            // numClients = Object.keys(allUsers).length;
            numClients = allUsers;
        }
        if(numClients === 0){
            client.emit('unknownGame');
            return;
        }
        else if(numClients >= 2){
            client.emit('tooManyPlayers');
            return;
        }

        clientRooms[client.id] = colorCode.Code;
        client.join(colorCode.Code);
        client.number = 2;
        client.emit('init', 2);

        state[colorCode.Code].players[1].color = colorCode.color;

        // set timer to start the game!
        startGameInterval(colorCode.Code);
        // setTimeout(() => { startGameInterval(colorCode.Code) }, 0);
    });

    client.on('replayGame', (roomName) => {
        io.sockets.in(roomName).emit('replayGame2', roomName);
    });

    client.on('replayGame2', (roomName) =>{
        const color1 = state[roomName].players[0].color;
        const color2 = state[roomName].players[1].color;
        state[roomName] = initGame();
        state[roomName].players[0].color = color1;
        state[roomName].players[1].color = color2;
    });
});

//what we do here is use setinterval to just create a ticking clock for our framerate
function startGameInterval(roomName){
    const intervalId = setInterval(() => {
        //triggering game mechanics
        const winner = gameLoop(state[roomName]); 
        
        // if 0: continue
        // else if 1: player 1 is winner
        // else if 2: player 2 is winner
        if(winner == 0){
            emitGameState(roomName, state[roomName]);
        }
        else{
            // state[roomName] = null;
            emitGameOver(roomName, winner);
            // clearInterval(intervalId);
        }
    }, 1000 / frameRate);

    function emitGameState(roomName, state){
        //emit to all clients in room roomName
        io.sockets.in(roomName).emit('gameState', JSON.stringify(state));

    }

    function emitGameOver(roomName, winner){
        io.sockets.in(roomName).emit('gameOver', JSON.stringify({winner}));
    }
}
io.listen(process.env.PORT || 3000);