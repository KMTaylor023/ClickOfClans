const xxh = require('xxhashjs');
const Room = require('./classes/Room.js');
const Attack = require('./classes/Attack.js');

const NUM_SKINS = 3; // number of available skins

// Pulls in the messages object, where all message names are stored for consistency
const Messages = require('../client/Messages.js');

const LOBBY_NAME = 'lobby';
const MAX_ROOM_SIZE = 4;

// our socketio instance
let io;

// object to store room hosts
const rooms = {};

// lobby system sends rooms object, so directly attatching hosts is bad
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

  // skin related socket properties
  socket.skin = null; // what skin the user has equipped
  socket.skinArray = []; // what skins the socket purchased
  // initialize the array
  for (let i = 0; i < NUM_SKINS; i++) {
    socket.skinArray[i] = false;
  }
};

// called on join to send 2 ads to the socket to display
const sendAds = (sock) => {
  const socket = sock;

  const ads = {};

  // determine ad 1
  let randNum = Math.floor(Math.random() * 5) + 1; // 1 to 5
  ads.ad1 = `ad${randNum}.png`;

  // determine ad 2
  randNum = Math.floor(Math.random() * 5) + 6; // 6 to 10
  ads.ad2 = `ad${randNum}.png`;

  socket.emit(Messages.C_Get_Ads, ads);
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

// host relay functions ++++++++++++++++++++++++++++++++++++++++++++++++
// send the host processed data from a click event to the whole room
const hostClick = (sock) => {
  const socket = sock;

  socket.on(Messages.H_Currency_Result, (data) => {
    io.sockets.in(socket.roomString).emit(Messages.C_Currency_Result, data);
  });
};

// send the clients information about a hit on a structure
const hostAttackStruct = (sock) => {
  const socket = sock;

  socket.on(Messages.H_Attack_Struct, (data) => {
    io.sockets.in(socket.roomString).emit(Messages.C_Attack_Struct, data);
  });
};


// send the host processed data from a fired attack event to the whole room
const hostAttackFired = (sock) => {
  const socket = sock;

  socket.on(Messages.H_Attack_Update, (data) => {
    io.sockets.in(socket.roomString).emit(Messages.C_Attack_Update, data);
  });
};

const hostAttackCreate = (sock) => {
  const socket = sock;

  socket.on(Messages.H_Attack_Create, (data) => {
    io.sockets.in(socket.roomString).emit(Messages.C_Attack_Create, data);
  });
};

const hostPurchaseStructure = (sock) => {
  const socket = sock;

  socket.on(Messages.H_Purchase_Structure, (data) => {
    io.sockets.in(socket.roomString).emit(Messages.H_Purchase_Structure, data);
  });
};

// send the host processed data from an attack hit event to the whole room
const hostAttackHit = (sock) => {
  const socket = sock;

  socket.on(Messages.H_Attack_Hit, (data) => {
    io.sockets.in(socket.roomString).emit(Messages.C_Attack_Hit, data);
  });
};

// send the player data for the room to the whole room
const hostRoomUpdate = (sock) => {
  const socket = sock;

  socket.on(Messages.H_Room_Update, (data) => {
    io.sockets.in(socket.roomString).emit(Messages.C_Room_Update, data);
  });
};

// send new state to the players
const hostStateChange = (sock) => {
  const socket = sock;

  socket.on(Messages.H_State_Change, (data) => {
    io.sockets.in(socket.roomString).emit(Messages.C_State_Change, data);
  });
};

// helper function to set a players playernum
const setPlayerNum = (rm, sock) => {
  const socket = sock;
  const room = rm;

  for (let i = 0; i < room.openSpaces.length; i++) {
    if (!room.openSpaces[i]) {
      room.openSpaces[i] = socket.hash;
      socket.playerNum = i;
      return;
    }
  }
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

  setPlayerNum(room, socket);
  // what to do if there is or isn't a host
  if (room.players.length === 0) {
    room.hostSocketHash = socket.hash;
    socket.emit(Messages.H_Become_Host, {});
    socket.host = true;

    // set up host listeners
    hostClick(socket);
    hostAttackFired(socket);
    hostAttackHit(socket);
    hostAttackStruct(socket);
    hostAttackCreate(socket);
    hostRoomUpdate(socket);
    hostPurchaseStructure(socket);
    hostStateChange(socket);

    socket.hostSocket = socket;
    hosts[socket.hash] = socket;
  } else {
    socket.hostSocket = hosts[room.hostSocketHash];
  }
  const player = {
    hash: socket.hash, name: socket.playerName, playerNum: socket.playerNum, skin: socket.skin,
  };
  socket.hostSocket.emit(Messages.H_Player_Joined, player);


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

    room.openSpaces[socket.playerNum] = undefined;

    delete socket.playerNum;

    if (socket.host) {
      delete hosts[socket.hash];
      io.sockets.in(socket.roomString).emit(Messages.C_Host_Left, {});
      room.players = [];
      room.full = true;
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

const onLeaveRoom = (sock) => {
  const socket = sock;

  socket.on(Messages.S_Leave, () => {
    leaveRoom(socket);
  });
};

// on skin actions
const onSkins = (sock) => {
  const socket = sock;

  socket.on(Messages.C_Buy_Skin, (dt) => {
    const data = dt;
    // "purchase" the skin
    socket.skinArray[data.number] = true;

    // tell the client the skin was bought
    data.bought = true;

    // send the client that the skin was purchased successfully
    socket.emit(Messages.S_Buy_Skin, data);
  });

  socket.on(Messages.C_Equip_Skin, (data) => {
    // verify the skin is owned
    if (socket.skinArray[data.number]) {
      // set skin
      socket.skin = data.number;

      // send message to the client that the skin was equipped
      socket.emit(Messages.S_Equip_Skin, { skin: data.skin, number: data.number, success: true });
    } else {
      // send message to the client that the skin wasnt equipped
      socket.emit(Messages.S_Equip_Skin, { skin: data.skin, number: data.number, success: false });
    }
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
    onLeaveRoom(socket);
    onDisconnect(socket);
    onCreateRoom(socket);
    onSkins(socket);

    socket.emit(Messages.S_SetUser, socket.hash);
    sendAds(socket);

    socket.on(Messages.C_Ready, () => {
      // send the hash of the readied player to the host
      socket.hostSocket.emit(Messages.H_Ready, socket.hash);
    });

    socket.on(Messages.C_Currency_Click, () => {
      // send the hash of the clicking user to the room host
      socket.hostSocket.emit(Messages.H_Currency_Click, socket.hash);
    });

    socket.on(Messages.C_Attack_Click, (data) => {
      // get a hash for attack
      const ahash = doHash(socket.id);

      // const d = Object.assign({},data);

      // make a new attack
      // const attack = new Attack(ahash, d.originHash, d.targetHash, d.x, d.y, d.color);
      const attack = new Attack(
        ahash,
        data.originHash,
        data.targetHash,
        data.x,
        data.y,
        data.color,
      );

      // send the target data to the host
      socket.hostSocket.emit(Messages.H_Attack_Click, attack);
    });

    socket.on(Messages.C_Purchase_Structure, (data) => {
      socket.hostSocket.emit(Messages.H_Purchase_Structure, data);
    });

    enterLobby(socket);
  });
};

module.exports = setupSockets;
