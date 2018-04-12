//This is the clients socket
var socket = {};

let users = {};     //the users in the lobby the client is in
let attacks = {};   //any attacks being sent
let canvas;         //the canvas the game is on
let ctx;           //the canvas context
let mouseClicked = false;   //is the mouse currently clicked?

const client_showGame = () => {
  document.querySelector("#game").style.display = "block";
  document.querySelector("#lobby").style.display = "none";
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
        /*
        //get the keys
        const keys = Object.keys(users);

        //check if the click was on any of the players
        for (let i = 0; i < keys.length; i++){
            let player = users[keys[i]];

            if (mouse position is in player position){
                //check if player is you
                if (socket.hash === player.hash){
                    //send a currency click event
                }
                else{
                    //send an attack click event
                }
            }
        }
        */
    }
    
    //disable additional clicks
    mouseClicked = true;
};

//allow player to click again once they lift their mouse
const doMouseUp = () => {
    mouseClicked = false;
};

//TODO draw method, lerp method, player clickability

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