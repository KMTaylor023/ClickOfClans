//Holds all message names to and from server
//Meaning: C_: to client, H_: to host, S_: to server
const Messages = Object.freeze({
  //Client messages
  C_Update_Lobby: 'c_updateLobby',  //update the lobbylist
  C_Error: 'c_err',     //oh dear. theres been an error
  C_Currency_Click: 'c_currencyClick',      //I'm clicking for $$$$
  C_Currency_Result: 'c_currencyResult',    //the host told me a currency click happened
  C_Purchase_Structure: 'c_purchaseStructure', //buy a structure 
  C_Purchase_Structure_Result: 'c_purchaseStructureResult',
  C_Attack_Click: 'c_attackClick',      //Im firing an attack
  C_Attack_Update: 'c_attackResult',    //the host told me an attack fired
  C_Attack_Create: 'c_attackCreate', // the host told me an attack was created
  C_Attack_Hit: 'c_attackHit',      //the host said an attack hit
  C_Attack_Struct: 'c_attackStruct', // the host said a structure was hit
  C_Fortify: 'c_fortify',       // fortify a structure
  C_Fortified: 'c_fortified',       // fortified a structure
  C_Room_Update: 'c_roomUpdate',    //update users lsit with the list from host
  C_Player_Left: 'c_removePlayer',  //a player left the server
  C_Host_Left: 'c_hostLeft',  //a player left the server
  C_Get_Ads: 'c_ads',             //dispaly some ads
  C_Buy_Skin: 'c_buy',              //purchase a skin
  C_Equip_Skin: 'c_equip',          //equip a skin
  C_State_Change: 'c_gameStateChange',  //update your gamestate
  C_Ready: 'c_readyUp',             //tell the host you are ready to start
  C_Winner: 'c_winner',             //display the winner on the screen
  //Host messages
  H_Player_Joined: 'h_addPlayer',   //a new player joined the server
  H_Player_Left: 'h_removePlayer',  //a player left the server
  H_Currency_Click: 'h_currencyClick',  //process a currency click
  H_Currency_Result: 'h_currencyResult',    //results of a currency click
  H_Attack_Click: 'h_attackClick',      //process an attack click
  H_Attack_Update: 'h_attackUpdate',    //results of an attack click
  H_Attack_Create: 'h_attackCreate',
  H_Purchase_Structure: 'h_purchaseStructure', 
  H_Purchase_Structure_Result: 'h_purchaseStructureResult', 
  H_Attack_Struct: 'h_attackStruct', // when an attack hits a structure
  H_Fortify: 'h_fortify',           // fortify a structure
  H_Fortified: 'h_fortified',           // fortified a structure
  H_Attack_Hit: 'h_attackHit',          //a fired attack hit a target
  H_Become_Host: 'h_isHost',        //hey dude, thanks for hosting
  H_Room_Update: 'h_roomUpdate',     //use to send the game room info to the clients
  H_State_Change: 'h_gameStateChange',  //game state chenged hostside
  H_Started: 'h_started',  //game started
  H_Ready: 'h_readyUp',             //update a player's ready state
  H_Winner: 'h_winner',             //send the clients the player that won
  //Server messages
  S_Create_Room: 's_createRoom',     //server, make a room
  S_Disconnect: 'disconnect',        //disconnect from server
  S_Join: 'join',                    //server, I'm joining a room 
  S_Leave: 'leave',                    //server, I'm leaving a room 
  S_SetUser: 's_setUser',
  S_Buy_Skin: 's_buy',              //was it a successful purchase?
  S_Equip_Skin: 's_equip',          //did you equip it?
});

if(typeof module !== 'undefined')
  module.exports = Messages;