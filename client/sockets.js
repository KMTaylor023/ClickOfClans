/* ++++++ socket setup Functions ++++++ */

const onAds = (sock) => {
    const socket = sock;
    
    socket.on(Messages.C_Get_Ads, (data) => {
        //get ad1 and ad2 elements
        var ad1 = document.querySelector("#ad1");
        var ad2 = document.querySelector("#ad2");
        
        ad1.src = "./assets/" + data.ad1;
        ad2.src = "./assets/" + data.ad2;
    });
};

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
    
  socket.on(Messages.H_Become_Host, () =>
  {
      onHosted();
  });

  socket.on(Messages.S_SetUser, (hash, host) =>{
     myHash = hash; 
      myHost = host;
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
  socket.on(Messages.C_Attack_Update, (data) => {
      // update each attack
      // console.log(data);     
      attacks[data.hash].destX = data.destX;
      attacks[data.hash].destY = data.destY;
  });
    
  socket.on(Messages.C_Attack_Create, (data) => {
     users[data.originHash].population -= 10;
     attacks[data.hash] = data; 
  });
    
  //an attack hit
  socket.on(Messages.C_Attack_Hit, (data) => {
      //remove the attack that hit from attacks somehow
      //do attack hitting effects
      let at = attacks[data.hash];
      users[at.targetHash].population -= 50;
      delete attacks[data.hash]; 
  });
};


/* ------ socket setup Functions ------ */

const setupSocket = (sock) => { 
  
  onAds(socket);
  onLobby(socket);
  onRoomUpdate(socket);
  onGameUpdate(socket);

}