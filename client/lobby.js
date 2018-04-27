const gamelist = {};

const OPEN = 0;
const FULL = 1;
const STARTED = 2;
const OVER = 3;
const roomStatus = [['room open!', 'room_open'],
                    ['room full!', 'room_full'],
                    ['game started!', 'room_started'],
                    ['game over!', 'room_over'],
                   ];

var lobbyList = {};

var lobby_showLobby = () => {
  document.querySelector("#game").style.display = "none";
  document.querySelector("#lobby").style.display = "block";
    
  cancelAnimationFrame(animationFrame);
}

const joinRoom = (room) => {
  if(!room) return;
  //TODO change game state
  socket.emit(Messages.S_Join, {room});
  client_showGame();
};


const sendCreateRoom = (room) => {
  socket.emit(Messages.S_Create_Room,{room});
  client_showGame();
};

//initializes everything required for the lobby
const initializeLobby = () => {
  lobbyList = document.querySelector("#lobby_list");
  
  const nameText = document.querySelector('#room_name_input');
  document.querySelector('#create_room_button').addEventListener('click', (e) => {
    e.preventDefault(true);
    if (nameText.value === '') {
      return false;
    }
    sendCreateRoom(nameText.value);
    nameText.value = "";
    return false;
  });
  
};


//initializes a room
const initRoom = (name) => {
  const li = document.createElement('li');
  
  const namep = document.createElement('p');
  namep.classList.add("room_name");
  
  const countp = document.createElement('p');
  countp.classList.add("room_count");
  
  const statusp = document.createElement('p');
  statusp.classList.add("room_status");
  
  li.appendChild(namep);
  li.appendChild(countp);
  li.appendChild(statusp);
  roomClick(li);
  
  return li;
};

//when the room li is clikced
const roomClick = (roomli) => {
  const li = roomli;
  
  li.addEventListener('click', (e) => {
    e.preventDefault();
    if(!li.classList.contains(roomStatus[OPEN][1])){
      return false;
    }
    const room = li.querySelector('.room_name').innerHTML;
    joinRoom(room);
    return false;
  });
}

//sets up a room with the given data
const setupRoom = (roomli, name, count, status) => {
  const li = roomli;
  li.querySelector('.room_name').innerHTML = name;
  li.querySelector('.room_count').innerHTML = `Players: ${count}`;
  li.querySelector('.room_status').innerHTML = roomStatus[status][0];
  
  for(let i = 0; i < roomStatus.length; i++){
    li.classList.remove(roomStatus[i][1]);
  }
  li.classList.add(roomStatus[status][1]);
  li.id = `lobby_room_${name}`;
};

//updates the lobby, adds, removes, edits rooms
const manageLobby = (data) => {
  const keys = Object.keys(data);
  
  if (keys.length === 0) {
    return;
  }
  
  let li = {};
  
  for(let i = 0; i < keys.length; i++){
    const key = keys[i];
    const room = data[key];
    //this room is gonna get updated
    if(room.players.length > 0){
      //lets me know the li element reffereing to the room existed alreadt
      let existed = true;
      if(gamelist[key]){
        
        //finds the li if it currently exists
        li = lobbyList.querySelector(`#lobby_room_${key}`);
        if(li == null){
          //no li found, make a new one
          li = initRoom(gamelist[keys[i]]);
          existed = false
        }
      }
      else{
        //make a new li
        li = initRoom(gamelist[keys[i]]);
        existed = false;
      }
      
      gamelist[key] = room;
      
      let status = OPEN;
      
      if(room.full){
        status = FULL;
      } else if(room.started){
        status = STARTED;
      }
      else if(room.over){
        status = OVER;
      }
      
      setupRoom(li, key, room.players.length, status);
      
      if(!existed) lobbyList.appendChild(li);
    }
    else{ //the room will be deleted
      const offender = lobbyList.querySelector(`#lobby_room_${key}`);
      if(offender) lobbyList.removeChild(offender);
      delete gamelist[key];
    }
  }//end of for loop
  
  lobbyList.style.display = 'block';
  
  //no open rooms
  if(Object.keys(gamelist).length === 0){
    lobbyList.style.display = 'none';
  }
};