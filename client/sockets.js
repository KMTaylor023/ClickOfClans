/* ++++++ socket setup Functions ++++++ */

//get ad info from the server
const onAds = (sock) => {
    const socket = sock;
    
    socket.on(Messages.C_Get_Ads, (data) => {
        //get ad1 and ad2 elements
        var ad1 = document.querySelector("#ad1");
        var ad2 = document.querySelector("#ad2");
        
        ad1.src = "./assets/ads/" + data.ad1;
        ad2.src = "./assets/ads/" + data.ad2;
    });
};

//update skin info with info from the server
const onSkinUpdate = (sock) => {
    const socket = sock;
    
    //set up the socket's skin array
    var skinArray = [];
    var numSkins = document.getElementsByName("skin").length;   //get the number of skins in the game
    
    //initialize the array
    for (let i = 0; i < numSkins; i++){
        skinArray[i] = false;
    }
    
    socket.skinArray = skinArray;
    
    socket.on(Messages.S_Buy_Skin, (data) => {
        //determine if the skin was bought successfully
        if (data.bought){
            //set the skin to true in the skin array
            socket.skinArray[data.number] = true;
            
            //give the owned class to the skin element
            var skinElement = document.getElementById(data.skin);  //the section containing the bought skin
            skinElement.classList.add("owned");
        }
    });
    
    socket.on(Messages.S_Equip_Skin, (data) => {
        //determine if the skin was bought successfully
        if (data.success){
            //remove prior equipped skin
            var prevEquipped = document.getElementsByClassName("equipped");
            if (prevEquipped){
                for (let i = 0; i < prevEquipped.length; i++){
                    prevEquipped[i].classList.remove("equipped");
                }
            }
            //set the skin to true in the skin array
            socket.skin = data.number;
            
            //give the owned class to the skin element
            var skinElement = document.getElementById(data.skin);  //the section containing the bought skin
            skinElement.classList.add("equipped");
            
            console.dir('equipped ' + data.skin);
            console.log(skins[socket.skin]);
        }
        else{
            document.querySelector("#unsuccessfulEquip").style.display = "block";
        }
    });
};

const onLobby = (sock) => {
  const socket = sock;
  
  socket.on(Messages.C_Update_Lobby, (data) => {
    manageLobby(data);
  });
};

const setPlayers = () => {
  const keys = Object.keys(users);
  
  for(let i = 0; i < keys.length; i++){
    if(players[keys[i]]) continue;
    const user = users[keys[i]];
    players[keys[i]] = new Player(user.hash, user.name, user.playerNum, user.skin);
  }
}

//get the player data from the host
const onRoomUpdate = (sock) => {
  const socket = sock;
  
  socket.on(Messages.C_Room_Update, (data) => {
    users = data; 
    setPlayers();
  });
    
  socket.on(Messages.H_Become_Host, () =>
  {
      gameState = GameStates.READY_UP;
      onHosted();
  });

  socket.on(Messages.S_SetUser, (hash, host) =>{
  	 myHash = hash; 
  	 myHost = host;
  });
  
  socket.on(Messages.C_Player_Left, (data) => {
      delete users[data.hash];
      delete players[data.hash];
      
      const keys = Object.keys(attacks);
      for(let i = 0; i < keys.length; i++) {
        const atk = attacks[keys[i]];
        if (data.hash === atk.originHash || data.hash === atk.targetHash)
          delete attacks[keys[i]];
      }
  });
    
  socket.on(Messages.C_Host_Left, () => {
      users = {};
      players = {};
      attacks = {};
      
      lobby_showLobby();
      socket.emit(Messages.S_Leave, {});
  });
};

//get the game updates from the host
const onGameUpdate = (sock) => {
  const socket = sock;
    
  //results of a state change
  socket.on(Messages.C_State_Change, (data) => {
      gameState = data;
  });
  
  //results of a currency click
  socket.on(Messages.C_Currency_Result, (data) => {
      //ignore old messages  
      if (players[data.hash].lastUpdate >= data.lastUpdate){ 
          return;
      }
      
      //update the data
      users[data.hash] = data;  
      players[data.hash].population = data.population;
  });
    
  //results of an attack click
  socket.on(Messages.C_Attack_Update, (data) => {
      // update each attack
      // console.log(data);     
      var attackData = data;
      var attackDataKeys = Object.keys(attackData); 
      for(var i = 0; i < attackDataKeys.length; i++)
      { 
          if(attacks[attackData[i].hash]){
            //  attacks[attackData[i].hash].alpha = 0.05;
            attacks[attackData[i].hash].destX = attackData[i].x;
            attacks[attackData[i].hash].destY = attackData[i].y;
            attacks[attackData[i].hash].updateTick = attackData[i].tick;
          }
      }
      
  });
    
  socket.on(Messages.C_Attack_Create, (data) => {
     //only subtract pop if not the host
     if (!socket.isHost){
         players[data.originHash].population -= 10;
     }
     users[data.originHash].population -= 10;
     attacks[data.hash] = data; 
  });
    
  //an attack hit
  socket.on(Messages.C_Attack_Hit, (data) => {
      //remove the attack that hit from attacks somehow
      //do attack hitting effects
      let at = attacks[data.hash];
      players[at.targetHash].population -= 50;
      users[at.targetHash].population -= 50;
      
      //check if the player died
      if (players[at.targetHash].population <= 0){
          players[at.targetHash].dead = true;
      }
      delete attacks[data.hash]; 
  });
    
  // a structure was hit
  socket.on(Messages.C_Attack_Struct, (data) => {
      
      players[data.dest].structures[data.lane].health -= 50;
      if (players[data.dest].structures[data.lane].health <= 0){
          players[data.dest].structures[data.lane].type = STRUCTURE_TYPES.PLACEHOLDER;
      }
      delete attacks[data.hash]; 
  });
};


/* ------ socket setup Functions ------ */

const setupSocket = (sock) => { 
  
  onAds(socket);
  onLobby(socket);
  onRoomUpdate(socket);
  onGameUpdate(socket);
  onSkinUpdate(socket);
  socket.isHost = false;        //initially not a host
    
}