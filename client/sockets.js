/* ++++++ socket setup Functions ++++++ */

const onLobby = (sock) => {
  const socket = sock;
  
  socket.on(Messages.C_Update_Lobby, (data) => {
    manageLobby(data);
  });
};

//get the player data from the host
const onRoomUpdate = (sock) => {
  const socket = sock;
  
  socket.on(Messages.C_Room_Update, (data) => {
    users = data;
  });
};

//get the game updates from the host
const onGameUpdate = (sock) => {
  const socket = sock;
  
  //results of a currency click
  socket.on(Messages.C_Currency_Result, (data) => {
      //ignore old messages
      if (users[data.hash].lastUpdate >= data.lastUpdate){
          return;
      }
      //update the data
      users[data.hash] = data;
  });
    
  //results of an attack click
  socket.on(Messages.C_Attack_Result, (data) => {
      //add the attack to the screen
      attacks.push(data);
  });
    
  //an attack hit
  socket.on(Messages.C_Attack_Hit, (data) => {
      //remove the attack that hit from attacks somehow
      //do attack hitting effects
  });
};

/* ------ socket setup Functions ------ */

const setupSocket = (sock) => {
  
  onLobby(socket);
  onRoomUpdate(socket);
  onGameUpdate(socket);
  
}