/* ++++++ socket setup Functions ++++++ */

const onLobby = (sock) => {
  const socket = sock;
  
  socket.on(Messages.C_Update_Lobby, (data) => {
    manageLobby(data);
  });
};

/* ------ socket setup Functions ------ */

const setupSocket = (sock) => {
  
  onLobby(socket);
}