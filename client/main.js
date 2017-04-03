let canvas;
let ctx;
let walkImage;
//our websocket connection
let socket; 
let hash;
let animationFrame;


let squares = {};

const keyDownHandler = (e) => {
  var keyPressed = e.which;
  const square = squares[hash];

  // W OR UP
  if(keyPressed === 32) {
    square.jump = true;
  }
  // A OR LEFT
  else if(keyPressed === 65 || keyPressed === 37) {
    square.moveLeft = true;
  }
  // D OR RIGHT
  else if(keyPressed === 68 || keyPressed === 39) {
    console.log("Right Pressed 1");
    square.moveRight = true;
  }
};

const keyUpHandler = (e) => {
  var keyPressed = e.which;
  const square = squares[hash];

  // W OR UP
  if(keyPressed === 32) {
    //square.jump = false;
  }
  // A OR LEFT
  else if(keyPressed === 65 || keyPressed === 37) {
    square.moveLeft = false;
  }
  // D OR RIGHT
  else if(keyPressed === 68 || keyPressed === 39) {
    square.moveRight = false;
  }

};
const init = () => {
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