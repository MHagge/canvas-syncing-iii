// our custom message class for sending message back
// to the main process
const Message = require('./messages/Message.js');

let charList = {}; // list of characters

/*
probably do some gravity calculations here!?!??!??
*/
// i dunno
const checkGravity = () => {
  const keys = Object.keys(charList);
  const characters = charList;

  for (let i = 0; i < keys.length; i++) {
    const char1 = characters[keys[i]];
    if (char1.y < (400 - (char1.height / 2))) {
      // move the last x/y to our previous x/y variables
      char1.prevX = char1.x;
      char1.prevY = char1.y;

      char1.destY += 4;

      // char1.alpha = 0.05;

      // update their time stamp?
      // char1.lastUpdate = new Date().getTime();

      process.send(new Message('applyGravity', char1));
    }
  }
};
setInterval(() => {
  checkGravity();
}, 20);

process.on('message', (messageObject) => {
  // check our custom message object for the type
  switch (messageObject.type) {
      // if message type is charList
    case 'charList': {
      // update our character list with the data provided
      charList = messageObject.data;
      break;
    }
      // if message type is char
    case 'char': {
      // update a specific character with the character provided
      const character = messageObject.data;
      charList[character.hash] = character;
      break;
    }
      // otherwise default
    default: {
      console.log('Type not recognized');
    }
  }
});
