const xxh = require('xxhashjs');

// node built-in module to start separate processes
// managed by this node process. This means they will
// have separate memory and processing (can run across processor cores)
const child = require('child_process');// woooo eeee hokay dokey batman


// Character custom class
const Character = require('./messages/Character.js');
// Custom message class for sending messages to our other process
const Message = require('./messages/Message.js');


// object to hold user character objects
const charList = {};

// socketio server instance
let io;

const physics = child.fork('./server/physics.js');

physics.on('message', (m) => {
  // since we are using a custom message object with a type
  // we know we can check the type field to see what type of
  // message we are receiving
  switch (m.type) {


    // ??? i put this here?

    case 'applyGravity': {
      io.sockets.in('room1').emit('applyGravity', m.data);
      break;
    }
     // noooo???

    // otherwise we will assume we do not recongize the message type
    default: {
      console.log('Received unclear type from physics');
    }
  }
});
// when we receive an error from our physics process
physics.on('error', (error) => {
  console.dir(error);
});

// when our physics process closes - meaning the process exited
// and all streams/files/etc have been closed
physics.on('close', (code, signal) => {
  console.log(`Child closed with ${code} ${signal}`);
});

// when our physics process exits - meaning it finished processing
// but there might still be streams/files/etc open
physics.on('exit', (code, signal) => {
  console.log(`Child exited with ${code} ${signal}`);
});
// physics will have a on listener for this
physics.send(new Message('charList', charList));

const setupSockets = (ioServer) => {
  // set our io server instance
  io = ioServer;

  // on socket connections
  io.on('connection', (sock) => {
    const socket = sock;

    // join user to our socket room
    socket.join('room1');

    // create a unique id for the user based on the socket id and time
    const hash = xxh.h32(`${socket.id}${new Date().getTime()}`, 0xCAFEBABE).toString(16);

    // create a new character and store it by its unique id
    charList[hash] = new Character(hash);

    // add the id to the user's socket object for quick reference
    socket.hash = hash;

    // emit a joined event to the user and send them their character
    socket.emit('joined', charList[hash]);

    // when this user sends the server a movement update
    socket.on('movementUpdate', (data) => {
      // console.log("I've been wondering");
      // update the user's info
      // NOTICE: THIS IS NOT VALIDED AND IS UNSAFE
      charList[socket.hash] = data;
      // update the timestamp of the last change for this character
      charList[socket.hash].lastUpdate = new Date().getTime();

      // update our physics simulation with the character's updates
      physics.send(new Message('charList', charList));

      // notify everyone of the user's updated movement
      io.sockets.in('room1').emit('updatedMovement', charList[socket.hash]);
    });

    // when the user disconnects
    socket.on('disconnect', () => {
      // let everyone know this user left
      io.sockets.in('room1').emit('left', charList[socket.hash]);
      // remove this user from our object
      delete charList[socket.hash];
      // update the character list in our physics calculations
      physics.send(new Message('charList', charList));

      // remove this user from the socket room
      socket.leave('room1');
    });
  });
};

module.exports.setupSockets = setupSockets;
