//Holds all message names to and from server
//Meaning: C_: to client, H_: to host, S_: to server
const Messages = Object.freeze({
  //Client messages
  C_Update_Lobby: 'c_updateLobby',  //update the lobbylist
  C_Error: 'c_err',     //oh dear. theres been an error
  C_Currency_Click: 'c_currencyClick',      //I'm clicking for $$$$
  C_Currency_Result: 'c_currencyResult',    //the host told me a currency click happened
  C_Attack_Click: 'c_attackClick',      //Im firing an attack
  C_Attack_Update: 'c_attackResult',    //the host told me an attack fired
  C_Attack_Hit: 'c_attackHit',      //the host said an attack hit
  C_Room_Update: 'c_roomUpdate',    //update users lsit with the list from host
  C_Player_Left: 'c_removePlayer',  //a player left the server
  //Host messages
  H_Player_Joined: 'h_addPlayer',   //a new player joined the server
  H_Player_Left: 'h_removePlayer',  //a player left the server
  H_Currency_Click: 'h_currencyClick',  //process a currency click
  H_Currency_Result: 'h_currencyResult',    //results of a currency click
  H_Attack_Click: 'h_attackClick',      //process an attack click
  H_Attack_Update: 'h_attackUpdate',    //results of an attack click
  H_Attack_Hit: 'h_attackHit',          //a fired attack hit a target
  H_Become_Host: 'h_isHost',        //hey dude, thanks for hosting
  H_Room_Update: 'h_roomUpdate',     //use to send the game room info to the clients
  //Server messages
  S_Create_Room: 's_createRoom',     //server, make a room
  S_Disconnect: 'disconnect',        //disconnect from server
  S_Join: 'join',                    //server, I'm joining a room 
  S_SetUser: 's_setUser',
});

if(typeof module !== 'undefined')
  module.exports = Messages;