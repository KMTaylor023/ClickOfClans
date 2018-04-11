//This is the clients socket
var socket = {};

const client_showGame = () => {
  document.querySelector("#game").style.display = "block";
  document.querySelector("#lobby").style.display = "none";
}


const init = () => {
  initializeLobby();//initialize lobby elements
  

  socket = io.connect();

  setupSocket(socket);
};

window.onload = init;