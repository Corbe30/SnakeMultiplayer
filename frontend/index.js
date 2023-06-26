const bgColor = '#231f20';
var snakeColor1 = '#87ceeb';
var snakeColor2 = 'yellow';
const foodColor  = 'grey';

var socket = io('https://snake-game-xt2x.onrender.com', { transports : ['websocket'] });

let canvas, context;
let playerNumber;
let gameActive = false;

socket.on('gameState', handleGameState);
socket.on('gameOver', handleGameOver);
socket.on('init', handleInit);
socket.on('gameCode', handleGameCode);
socket.on('unknownGame', handleunknownGame);
socket.on('tooManyPlayers', handletooManyPlayers);
socket.on('replayGame2', replayGame2);

const gameScreen = document.getElementById('gameScreen');
const initialScreen = document.getElementById('initialScreen');
const newGameBtn = document.getElementById('newGameBtn');
const joinGameBtn = document.getElementById('joinGameBtn');
const gameCodeInput = document.getElementById('gameCodeInput');
const gameCodeDisplay = document.getElementById('gameCodeDisplay');
const gameOverText = document.getElementById('gameOver');
const replayGameBtn = document.getElementById('replayGameBtn');

newGameBtn.addEventListener('click', newGame);
joinGameBtn.addEventListener('click', joinGame);
replayGameBtn.addEventListener('click', replayGame);

function newGame(){
    var snakeColor = document.querySelector('input[name="color"]:checked').id;
    snakeColor1 = snakeColor;
    socket.emit('newGame', snakeColor);
    init();
}

function joinGame(){
    var snakeColor = document.querySelector('input[name="color"]:checked').id;
    snakeColor2 = snakeColor;
    const code = gameCodeInput.value;

    const toSend = {
        Code: code,
        color: snakeColor,
    }
    socket.emit('joinGame', toSend);
    init();
}


// instantiating global variables in an initiating function

function init(){

    initialScreen.style.display = "none";
    gameScreen.style.display = "block";

    canvas = document.getElementById('canvas');
    context = canvas.getContext('2d');

    canvas.width = 600;
    canvas.height = 600;

    context.fillStyle = bgColor;
    context.fillRect(0, 0, canvas.width, canvas.height);

    document.addEventListener('keydown', keyDown);
    gameActive = true;
}

function keyDown(e){
    // console.log(e.keyCode);
    socket.emit('keydown', e.keyCode);
}

//updates position of food and player (with paintPlayer function)
function paintGame(state){
    context.fillStyle = bgColor;
    context.fillRect(0, 0, canvas.width, canvas.height);

    document.getElementById("playerOneScore").style.color = state.players[0].color;
    document.getElementById("playerTwoScore").style.color = state.players[1].color;
    
    const food = state.food;
    const gridsize = state.gridsize;
    // calculates pixel/grid square in canvas. 600/20 = 30px/sq
    // how many pixels represent one square in game space.
    const size = canvas.width / gridsize;

    context.fillStyle = foodColor;
    // game space (food.x) to pixel space (*size)
    context.fillRect(food.x*size, food.y*size, size, size);

    paintPlayer(state.players[0], size, state.players[0].color);
    document.getElementById("playerOneScore").innerHTML = Object.keys(state.players[0].snake).length - 3;
    paintPlayer(state.players[1], size, state.players[1].color);
    document.getElementById("playerTwoScore").innerHTML = Object.keys(state.players[1].snake).length - 3;
}

// function getGradient() {
//     var grd = context.createLinearGradient(0, 0, 600, 0);
//     grd.addColorStop(0, "hotpink");
//     grd.addColorStop(1, "red");
//     return grd;
// }

function paintPlayer(playerState, size, color){
    //gameState.snake contains coords of blocks of snake.
    const snake = playerState.snake;
    for(let cell of snake){

        // var my_gradient = getGradient();

        // context.fillStyle = my_gradient;
        context.fillStyle = color;
        context.fillRect(cell.x*size, cell.y*size, size, size);
    }
}

function handleInit(number){
    playerNumber = number;

}

//whenever server sends an updated gamestate, we call this function.
function handleGameState(gameState){

    if(!gameActive) return;

    gameState = JSON.parse(gameState); // string to JS object
     
    // what happens when we call paintGame without requestAnimationFrame?
    window.requestAnimationFrame(() => {paintGame(gameState)});
}

function handleGameOver(data){

    if(!gameActive) return;
    gameOverText.style.visibility='visible';
    replayGameBtn.style.visibility='visible';
    
    data = JSON.parse(data);
    if(data.winner == playerNumber){
        gameOverText.classList.remove('alert-danger');
        gameOverText.classList.add('alert-success');
        gameOverText.innerHTML = "you win";
    } 
    else{
        gameOverText.classList.remove('alert-success');
        gameOverText.classList.add('alert-danger');
        gameOverText.innerHTML = "you lose";
    } 
    gameActive = false;

}

function handleGameCode(gameCode){
    gameCodeDisplay.innerText = gameCode;
}

function handleunknownGame(){
    reset();
    alert('Unknown game code');
}

function handletooManyPlayers(){
    reset();
    alert('already in progress');
}

function reset(){
    playerNumber = null;
    gameCodeInput.value = "";
    gameCodeDisplay.innerText = "";
    initialScreen.style.display = "block";
    gameScreen.style.display = "none";
}

function replayGame(){
    // gameActive = true;
    // init();
    socket.emit('replayGame', gameCodeDisplay.innerText);
}

function replayGame2(roomName){
    gameActive = true;
    socket.emit('replayGame2', roomName);
}
