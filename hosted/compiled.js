"use strict";

var directions = {
  LEFT: 0,
  FORWARD: 1,
  RIGHT: 2
};

var spriteSizes = {
  WIDTH: 61,
  HEIGHT: 121
};

var lerp = function lerp(v0, v1, alpha) {
  return (1 - alpha) * v0 + alpha * v1;
};

//redraw with requestAnimationFrame
var redraw = function redraw(time) {
  //console.log("Hello..");
  //update this user's positions
  updatePosition();

  ctx.clearRect(0, 0, 500, 500);

  //each user id
  var keys = Object.keys(squares);

  //for each user
  for (var i = 0; i < keys.length; i++) {

    var square = squares[keys[i]];

    //if alpha less than 1, increase it by 0.01
    if (square.alpha < 1) square.alpha += 0.05;

    //applying a filter effect to other characters
    //in order to see our character easily
    if (square.hash === hash) {
      ctx.filter = "none";
    } else {
      ctx.filter = "hue-rotate(40deg)";
    }

    //calculate lerp of the x/y from the destinations
    square.x = lerp(square.prevX, square.destX, square.alpha);
    square.y = lerp(square.prevY, square.destY, square.alpha);

    //draw our characters
    ctx.drawImage(walkImage, spriteSizes.WIDTH, spriteSizes.HEIGHT * square.direction, spriteSizes.WIDTH, spriteSizes.HEIGHT, square.x, square.y, spriteSizes.WIDTH, spriteSizes.HEIGHT);

    //highlight collision box for each character
    ctx.strokeRect(square.x, square.y, spriteSizes.WIDTH, spriteSizes.HEIGHT);
  }

  //set our next animation frame
  animationFrame = requestAnimationFrame(redraw);
};
'use strict';

var canvas = void 0;
var ctx = void 0;
var walkImage = void 0;
//our websocket connection
var socket = void 0;
var hash = void 0;
var animationFrame = void 0;

var squares = {};

var keyDownHandler = function keyDownHandler(e) {
  var keyPressed = e.which;
  var square = squares[hash];

  // W OR UP
  if (keyPressed === 32) {
    square.jump = true;
  }
  // A OR LEFT
  else if (keyPressed === 65 || keyPressed === 37) {
      square.moveLeft = true;
    }
    // D OR RIGHT
    else if (keyPressed === 68 || keyPressed === 39) {
        console.log("Right Pressed 1");
        square.moveRight = true;
      }
};

var keyUpHandler = function keyUpHandler(e) {
  var keyPressed = e.which;
  var square = squares[hash];

  // W OR UP
  if (keyPressed === 32) {}
  //square.jump = false;

  // A OR LEFT
  else if (keyPressed === 65 || keyPressed === 37) {
      square.moveLeft = false;
    }
    // D OR RIGHT
    else if (keyPressed === 68 || keyPressed === 39) {
        square.moveRight = false;
      }
};
var init = function init() {
  walkImage = document.querySelector('#walk');

  canvas = document.querySelector('#canvas');
  ctx = canvas.getContext('2d');

  socket = io.connect();

  socket.on('joined', setUser); //when user joins
  socket.on('updatedMovement', update); //when players move
  socket.on('applyGravity', update); //updates gravity
  socket.on('left', removeUser); //when a user leaves

  document.body.addEventListener('keydown', keyDownHandler);
  document.body.addEventListener('keyup', keyUpHandler);
};

window.onload = init;
'use strict';

//when we receive a character update
var update = function update(data) {
  //console.log("if after all this time you'd like to meet");
  //if this client does not have that character (based on their id)
  //then add them
  if (!squares[data.hash]) {
    squares[data.hash] = data;
    return;
  }

  /*
  //if it's the client's own character return
  if(data.hash === hash) {
    return;
  }
  */

  //if we received an old message,  based on if their last update was older than our last update
  if (squares[data.hash].lastUpdate >= data.lastUpdate) {
    return;
  }

  //grab the character based on the character id we received
  var square = squares[data.hash];
  //update their direction and movement information
  //but NOT their x/y since we are animating those
  square.prevX = data.prevX;
  square.prevY = data.prevY;
  square.destX = data.destX;
  square.destY = data.destY;
  square.direction = data.direction;
  square.moveLeft = data.moveLeft;
  square.moveRight = data.moveRight;
  square.moveDown = data.moveDown;
  square.moveUp = data.moveUp;
  square.alpha = 0.05;
};

/* yeah uh so my thoughts are don't do this 
gravity is supposed to be calculated all server side??

....

orrr
i can use that ther update function above for my purposes yiss? it's not tied to player controlled movement 

so maybe..?
const updateGravity = () => {
  
}
*/

//function to remove a character from our character list
var removeUser = function removeUser(data) {
  //if we have that character, remove them
  if (squares[data.hash]) {
    delete squares[data.hash];
  }
};

//function to set this user's character
var setUser = function setUser(data) {
  hash = data.hash; //set this user's hash to the unique one they received
  squares[hash] = data; //set the character by their hash
  requestAnimationFrame(redraw); //start animating
};

//update this user's positions based on keyboard input
var updatePosition = function updatePosition() {
  //console.log("it's me..");
  var square = squares[hash];

  //move the last x/y to our previous x/y variables
  square.prevX = square.x;
  square.prevY = square.y;

  //if user is moving left, decrease x
  if (square.moveLeft && square.destX > 0) {
    square.destX -= 2;
  }
  //if user is moving right, increase x
  if (square.moveRight && square.destX < 400) {
    square.destX += 2;
  }
  //determine direction based on the inputs of direction keys
  if (square.moveLeft) {
    square.direction = directions.LEFT;
  }

  if (square.moveRight) {
    square.direction = directions.RIGHT;
  }

  if (square.jump) {
    square.direction = directions.FORWARD;

    square.jumpHeight *= 0.8;

    square.destY -= square.jumpHeight;

    if (square.jumpHeight < 0.01) {
      square.jump = false;
      square.jumpHeight = 50;
    }
  }

  //reset this character's alpha so they are always smoothly animating
  square.alpha = 0.05;

  //send the updated movement request to the server to validate the movement.
  socket.emit('movementUpdate', square);
};
