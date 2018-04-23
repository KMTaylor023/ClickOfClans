
let attackIntervals = {};

const updateAttack = (hash) =>{
     
    // This calculation shouldn't actually have to happen
    // Do this calculation on Attack initialization
    var at = attacks[hash];  
    var originPlayer = players[at.originHash];
    var oX = originPlayer.x + playerHalfWidth;
    var oY = originPlayer.y + playerHalfHeight;
    var destPlayer = players[at.targetHash];
    var destX = destPlayer.x + playerHalfWidth;
    var destY = destPlayer.y + playerHalfHeight;
     
    var moveX = (destX - oX) / 100;
    var moveY = (destY - oY) / 100;   
    
    //console.log(at);
    
    at.destX += moveX;
    at.destY += moveY;
    at.updateTick += 1; 
     
    if(at.updateTick > 100)
    {
        socket.emit(Messages.H_Attack_Hit,attacks[hash]);
        
        // Delete and clear this interval
        clearInterval(attackIntervals[hash]); 
        delete attackIntervals[hash];
    }else
        socket.emit(Messages.H_Attack_Update,attacks[hash]);
    
}

const onHosted = () => { 
    document.querySelector("#debug").style.display = "block";
     
    socket.on(Messages.H_Player_Joined, (data) => { 
        // Add a new user 
        const player = new Player(data.hash, data.name, data.playerNum);
        data.lastUpdate = player.lastUpdate;
        data.population = player.population;
        users[data.hash] = data; 
        players[data.hash] = player;
        socket.emit(Messages.H_Room_Update,users);
    });
    
    socket.on(Messages.H_Currency_Click, (hash) =>{
        users[hash].population += 1;
        users[hash].lastUpdate = new Date().getTime();
        socket.emit(Messages.H_Currency_Result,users[hash]);
    });
    
    socket.on(Messages.H_Attack_Click, (at) => { 
        attacks[at.hash] = at;
        socket.emit(Messages.H_Attack_Create,attacks[at.hash]);
        attackIntervals[at.hash] = setInterval(updateAttack, 100, at.hash);
    });
}
