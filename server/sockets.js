const xxh = require('xxhashjs');
// custom class for the player
const Player = require('./classes/Player.js');
const Room = require('./classes/Room.js');

// Pulls in the messages object, where all message names are stored for consistency
const Messages = require('../client/Messages.js');

const LOBBY_NAME = 'lobby';
const MAX_ROOM_SIZE = 4;

// our socketio instance
let io;

// object to store room hosts
const rooms = {};

//lobby system sends rooms object, so directly attatching hosts is bad
const hosts = {};


// //Helper Functions

const doHash = string => xxh.h32(`${string}${new Date().getTime()}`, 0xFEFACADE).toString(16);

// sends a socket error
const socketErr = (socket, msg) => {
  socket.emit(Messages.C_Error, { msg });
};

// sets the socket to default state
const defaultSocket = (sock) => {
  const socket = sock;

  socket.host = false;
  socket.hostSocket = undefined;
  socket.roomString = undefined;
};

// Called when the socket FIRST joins the lobby, only first time
const enterLobby = (sock) => {
  const socket = sock;

  socket.emit(Messages.C_Update_Lobby, rooms);

  socket.join(LOBBY_NAME);
};

// updates lobby
const updateLobby = (room) => {
  const rdata = {};
  rdata[room.roomName] = room;
  io.to(LOBBY_NAME).emit(Messages.C_Update_Lobby, rdata);

  if (room.players.length === 0) {
    delete rooms[room.roomName];
  }
};

//host relay functions
//send the host processed data from a click event to the whole room
const hostClick = (sock) => {
    let socket = sock;
    
    socket.on(Messages.H_Currency_Result, (data) => {
        io.sockets.in(socket.roomString).emit(Messages.C_Currency_Result, data);
    });
};

//send the host processed data from a fired attack event to the whole room
const hostAttackFired = (sock) => {
    let socket = sock;
    
    socket.on(Messages.H_Attack_Result, (data) => {
        io.sockets.in(socket.roomString).emit(Messages.C_Attack_Result, data);
    });
};

//send the host processed data from an attack hit event to the whole room
const hostAttackHit = (sock) => {
    let socket = sock;
    
    socket.on(Messages.H_Attack_Hit, (data) => {
        io.sockets.in(socket.roomString).emit(Messages.C_Attack_Hit, data);
    });
};

//send the player data for the room to the whole room
const hostRoomUpdate = (sock) => {
    let socket = sock;
    
    socket.on(Messages.H_Room_Update, (data) => {
        io.sockets.in(socket.roomString).emit(Messages.C_Room_Update, data);
    });
};

// adds player to given room
const joinRoom = (sock, roomName) => {
  const socket = sock;

  // already in a room, couldn't have gotten here the correct way
  if (socket.roomString) {
    return socketErr(socket, 'Already in room');
  }

  if (!rooms[roomName]) {
    return socketErr(socket, 'Room not found');
  }

  if (rooms[roomName].full) {
    return socketErr(socket, 'Room is full');
  }

  const room = rooms[roomName];


  socket.join(roomName);
  socket.roomString = roomName;
    

  const player = new Player(socket.hash, socket.playerName);

  //what to do if there is or isn't a host
  if (room.players.length === 0) {
    room.hostSocketHash = socket.hash;
    socket.emit(Messages.H_Become_Host,{});
    socket.host = true;
    
    //set up host listeners
    hostClick(socket);
    hostAttackFired(socket);
    hostAttackHit(socket);
    hostRoomUpdate(socket);
    
     
      
    socket.hostSocket = socket;
    hosts[socket.hash] = socket; 
  } else {
    socket.hostSocket = hosts[room.hostSocketHash];
    socket.hostSocket.emit(Messages.H_Player_Joined, player);
  }
    


  room.players.push(socket.hash);

  if (room.players.length === MAX_ROOM_SIZE) {
    room.full = true;
  }
  return updateLobby(room);
};

// removes player from current room
const leaveRoom = (sock) => {
  const socket = sock;
  if (!socket.roomString) {
    return;// what room?
  }

  const s = socket.roomString;
  if (rooms[s]) {
    const room = rooms[s];
    // remove the player
    room.players.splice(room.players.indexOf(socket.hash));
    room.full = false;


    if (socket.host) {
      delete hosts[socket.hash];
    } else {
      hosts[room.hostSocketHash].emit(Messages.H_Player_Left, { hash: socket.hash });
      io.sockets.in(socket.roomString).emit(Messages.C_Player_Left, { hash: socket.hash });
    }

    updateLobby(room);
  }

  socket.leave(socket.roomString);
  delete socket.roomString;
};

/* ++++++ Socket functions ++++++ */

// creates a room for a socket
const onCreateRoom = (sock) => {
  const socket = sock;

  socket.on(Messages.S_Create_Room, (data) => {
    const { room } = data;
    if (!room || socket.roomString) {
      // Socket is already in a room, or no room name was given
      return;
    }

    // TODO validate is string and set max string length
    // TODO maybe allow mutilpe rooms of the same name, use hashes instead of name

    if (rooms[room] || room === LOBBY_NAME) {
      socketErr(socket, 'Room name already exists');
      return;
    }

    rooms[room] = new Room(room);

    joinRoom(socket, room);
  });
};

// on socket disconnect
const onDisconnect = (sock) => {
  const socket = sock;

  socket.on(Messages.S_Disconnect, () => {
    leaveRoom(socket);
    socket.leave(LOBBY_NAME);
    socket.removeAllListeners();
    delete socket.roomString;
  });
};

// on socket join room
const onJoinRoom = (sock) => {
  const socket = sock;

  socket.on(Messages.S_Join, (data) => {
    if (!data || !data.room) {
      return socketErr(socket, 'No room name given');
    }

    return joinRoom(socket, data.room);
  });
};

// function to setup our socket server
const setupSockets = (ioServer) => {
  io = ioServer;

  // on socket connections
  io.on('connection', (sock) => {
    const socket = sock;
    const hash = doHash(socket.id);
    socket.hash = hash;

    defaultSocket(socket);

    onJoinRoom(socket);
    onDisconnect(socket);
    onCreateRoom(socket);


    socket.on(Messages.C_Currency_Click, () => {
      // send the hash of the clicking user to the room host
      socket.roomHost.emit(Messages.H_Currency_Click, socket.hash);
    });

    socket.on(Messages.C_Attack_Click, (data) => {
        //get a hash for attack
        const hash = doHash(socket.id);
            
        //make a new attack
        let attack = new Attack(hash, data.originHash, data.targetHash, data.x, data.y, data.color);
        
      // send the target data to the host
      socket.roomHost.emit(Messages.H_Attack_Click, attack);
    });

    enterLobby(socket);
  });
};

module.exports = setupSockets;
