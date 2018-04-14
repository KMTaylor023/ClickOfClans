//This is the clients socket
var socket = {};

let users = {};     //the users in the lobby the client is in
let attacks = {};   //any attacks being sent
let canvas;         //the canvas the game is on
let ctx;           //the canvas context
let mouseClicked = false;   //is the mouse currently clicked?
let animationFrame; // current animatino frame

const client_showGame = () => {
  document.querySelector("#game").style.display = "block";
  document.querySelector("#lobby").style.display = "none";
    
  animationFrame = requestAnimationFrame(redraw);
}

// Function Name: getMouse()
// returns mouse position in local coordinate system of element
// Author: Tony Jefferson
// Last update: 3/1/2014
const getMouse = (e) => {
    var mouse = {}
    mouse.x = e.pageX - e.target.offsetLeft;
    mouse.y = e.pageY - e.target.offsetTop;
    return mouse;
}
        
//on click, check if a player was clicked
const doMouseDown = (e) => {
    //get location of mouse
    var mouse = getMouse(e);
    
    //make sure the player isnt clicking already
    if (!mouseClicked){
        //get the keys
        const keys = Object.keys(users);

        //check if the click was on any of the players
        for (let i = 0; i < keys.length; i++){
            let player = users[keys[i]];

            //if the click was in the square, send it to the server for points;
            if (mouse.x >= square.x && mouse.x <= square.x + square.width){
                if (mouse.y >= square.y && mouse.y <= square.y + square.height){
                    //check if player is you
                    if (socket.hash === player.hash){
                        //send a currency click event
                        socket.emit(Messages.C_Currency_Click, {hash: socket.hash});
                    }
                    else{
                        //send an attack click event
                        socket.emit(Messages.C_Currency_Click, 
                        {originHash: socket.hash, targetHash: player.hash, x: users[socket.hash].x, 
                         y: users[socket.hash].y, color: users[socket.hash].color});
                    }
                }
            }
        }
        
    }
    
    //disable additional clicks
    mouseClicked = true;
};

//allow player to click again once they lift their mouse
const doMouseUp = () => {
    mouseClicked = false;
};

const init = () => {
  initializeLobby();//initialize lobby elements
  
  // set up canvas stuff
  canvas = document.querySelector('canvas');
  ctx = canvas.getContext("2d");
  canvas.onmousedown = doMouseDown;
  canvas.onmouseup = doMouseUp;
    
  socket = io.connect();
    
  setupSocket(socket);
};

window.onload = init;