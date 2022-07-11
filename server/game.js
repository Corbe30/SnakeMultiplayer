const { gridSize } = require('./constants.js');

module.exports = {
    initGame,
    gameLoop,
    getUpdatedVelocity,
}

function initGame(){
    const state = createGameState();
    randomFood(state);
    return state;
}

function createGameState(){
    return {
        players: [{
            pos: {
              x: 3,
              y: 10,
            },
            vel: {
              x: 1,
              y: 0,
            },
            snake: [
              {x: 1, y: 10},
              {x: 2, y: 10},
              {x: 3, y: 10},
            ],
            color: 'red'
          }, {
            pos: {
              x: 17,
              y: 10,
            },
            vel: {
              x: -1,
              y: 0,
            },
            snake: [
              {x: 19, y: 10},
              {x: 18, y: 10},
              {x: 17, y: 10},
            ],
            color: 'blue'
          }],
        food: {},
        gridsize: gridSize,
    };   
}

// 2: game over, 1: , 0:
function gameLoop(state){

    if(!state) return;
    const playerOne = state.players[0];
    const playerTwo = state.players[1];

    state.players[0].pos.x += playerOne.vel.x;
    state.players[0].pos.y += playerOne.vel.y;

    state.players[1].pos.x += playerTwo.vel.x;
    state.players[1].pos.y += playerTwo.vel.y;

    // returns #player who won
    if(playerOne.pos.x < 0 || playerOne.pos.x >= gridSize || playerOne.pos.y < 0 || playerOne.pos.y >= gridSize){
        return 2;
    }

    if(playerTwo.pos.x < 0 || playerTwo.pos.x >= gridSize || playerTwo.pos.y < 0 || playerTwo.pos.y >= gridSize){
        return 1;
    }

    //if snake eats food
    if(state.food.x == playerOne.pos.x && state.food.y == playerOne.pos.y){
        
        // if the future position is valid, add it to snake. 
        playerOne.snake.push({...playerOne.pos});

        // var count = Object.keys(playerOne.snake).length;

        playerOne.pos.x += playerOne.vel.x;
        playerOne.pos.y += playerOne.vel.y;

        randomFood(state);
    }

    if(state.food.x == playerTwo.pos.x && state.food.y == playerTwo.pos.y){
        
        // if the future position is valid, add it to snake. 
        playerTwo.snake.push({...playerTwo.pos});

        playerTwo.pos.x += playerTwo.vel.x;
        playerTwo.pos.y += playerTwo.vel.y;

        randomFood(state);
    }

    //move snake forward
    if(playerOne.vel.x || playerOne.vel.y){ // snake is actually moving
        //check if snake has bit itself
        for(let cell of playerOne.snake){
            if(cell.x == playerOne.pos.x && cell.y == playerOne.pos.y){
                return 2;
            }
        }
        // not bite, so move the snake forward
        // snake moves forward by adding new block in front of head and deleting last block
        playerOne.snake.push({...playerOne.pos});
        playerOne.snake.shift();
    }

    if(playerTwo.vel.x || playerTwo.vel.y){ // snake is actually moving
        //check if snake has bit itself
        for(let cell of playerTwo.snake){
            if(cell.x == playerTwo.pos.x && cell.y == playerTwo.pos.y){
                return 1;
            }
        }
        // not bite, so move the snake forward
        // snake moves forward by adding new block in front of head and deleting last block
        playerTwo.snake.push({...playerTwo.pos});
        playerTwo.snake.shift();
    }

    return false;
}

function checkOverlap(foodx, foody, snake){
    for(let cell of snake){
        if(foodx == cell.x && foody == cell.y)
            return true;
    }
    return false;
}

function randomFood(state){
    let randFoodX = Math.floor(Math.random()*gridSize);
    let randFoodY = Math.floor(Math.random()*gridSize);

    //do not put food on top of snake~
    while(checkOverlap(randFoodX, randFoodY, state.players[0].snake) ||
          checkOverlap(randFoodX, randFoodY, state.players[1].snake)){
        randFoodX = Math.floor(Math.random()*gridSize);
        randFoodY = Math.floor(Math.random()*gridSize);
    }

    state.food.x = randFoodX;
    state.food.y = randFoodY;

}

function getUpdatedVelocity(keyCode){
    // console.log(keyCode);
    // if(keyCode == 37) return {x: -1, y: 0}; // left
    // if(keyCode == 38) return {x: 0, y: -1}; // up
    // if(keyCode == 39) return {x: 1, y: 0}; // right
    // if(keyCode == 40) return {x: 0, y: 1}; // down

    if(keyCode == 65) return {x: -1, y: 0}; // left
    if(keyCode == 87) return {x: 0, y: -1}; // up
    if(keyCode == 68) return {x: 1, y: 0}; // right
    if(keyCode == 83) return {x: 0, y: 1}; // down
}