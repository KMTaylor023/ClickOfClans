const xxh = require('xxhashjs');
// custom class for the player
const Player = require('./classes/Player.js');

// our socketio instance
let io;

//object to store room hosts
let rooms = {};

// function to setup our socket server
const setupSockets = (ioServer) => {
    io = ioServer;
    
    //on socket connections
    io.on('connection', (sock) => {
        const socket = sock;
        
        //just making filler room code that Keegan will change with the actual code
        socket.on('join', (data) => {
            socket.join(data.roomName);
            
            //replace with actual host code
            rooms[data.roomName] = socket;
            socket.host = true;
            
            //set the socket's host
            socket.roomHost = rooms[data.roomName];
            
            //set the socket's hash
            const hash = xxh.h32(`${socket.id}${new Date().getTime()}`, 0xFEFACADE).toString(16);
            
            //set the socket's hash
            socket.hash = hash;
            
            //make the player object for the socket
            const player = new Player(hash, data.name);
            
            //send the newly joined socket their player
            socket.emit('joined', player);
            
            //send the host the new character
            socket.roomHost.emit('h_newPlayer', player);
            
            //set host socket's listeners
            if (socket.host){
                //TODO
            }
        });
        
        socket.on('c_currencyClick', () => {
            //send the hash of the clicking user to the room host
            socket.roomHost.emit('h_currencyClick', socket.hash);
        });
        
        socket.on('c_attackClick', (data) => {
            //send the target data to the host
            socket.roomHost.emit('h_attackClick', data);
        });
    };
}

module.exports.setupSockets = setupSockets;