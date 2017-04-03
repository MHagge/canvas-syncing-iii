//when we receive a character update
const update = (data) => {
  //console.log("if after all this time you'd like to meet");
  //if this client does not have that character (based on their id)
  //then add them
  if(!squares[data.hash]) {
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
  if(squares[data.hash].lastUpdate >= data.lastUpdate) {
    return;
  }
  
  //grab the character based on the character id we received
  const square = squares[data.hash];
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
const removeUser = (data) => {
  //if we have that character, remove them
  if(squares[data.hash]) {
    delete squares[data.hash];
  }
};

//function to set this user's character
const setUser = (data) => {
  hash = data.hash; //set this user's hash to the unique one they received
  squares[hash] = data; //set the character by their hash
  requestAnimationFrame(redraw); //start animating
};

//update this user's positions based on keyboard input
const updatePosition = () => {
  //console.log("it's me..");
  const square = squares[hash];

  //move the last x/y to our previous x/y variables
  square.prevX = square.x;
  square.prevY = square.y;

  //if user is moving left, decrease x
  if(square.moveLeft && square.destX > 0) {
    square.destX -= 2;
  }
  //if user is moving right, increase x
  if(square.moveRight && square.destX < 400) {
    square.destX += 2;
  }
  //determine direction based on the inputs of direction keys
  if(square.moveLeft){ 
    square.direction = directions.LEFT;
  }

  if(square.moveRight){
    square.direction = directions.RIGHT;
  }
  
  if(square.jump){
    square.direction = directions.FORWARD;
    
    square.jumpHeight *= 0.8; 
    
    square.destY -= square.jumpHeight;
    
    if(square.jumpHeight < 0.01){
      square.jump = false;
      square.jumpHeight = 50;
    }
  }
  
 

  //reset this character's alpha so they are always smoothly animating
  square.alpha = 0.05;

  //send the updated movement request to the server to validate the movement.
  socket.emit('movementUpdate', square);
};

