//Holds all message names to and from server
//Meaning: C_: to client, H_: to host, S_: to server
const Messages = Object.freeze({
  //Client messages
  C_Update_Lobby: 'c_updateLobby',
  C_Error: 'c_err',
  C_Currency_Click: 'c_currencyClick',
  C_Attack_Click: 'c_attackClick',
  //Host messages
  H_Player_Joined: 'h_addPlayer',
  H_Player_Left: 'h_removePlayer',
  H_Currency_Click: 'h_currencyClick',
  H_Attack_Click: 'h_attackClick',
  H_Become_Host: 'h_isHost',
  //Server messages
  S_Create_Room: 's_createRoom',
  S_Disconnect: 'disconnect',
  S_Join: 'join',
});

if(typeof module !== 'undefined')
  module.exports = Messages;