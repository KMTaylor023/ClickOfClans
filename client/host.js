
let attackIntervals = {};

const updateAttack = (hash) =>{
     
    // This calculation shouldn't actually have to happen
    // Do this calculation on Attack initialization
    var at = attacks[hash];  
    var originPlayer = users[at.originHash];
    var oX = positions[originPlayer.playerNum].x;
    var oY = positions[originPlayer.playerNum].y;
    var destPlayer = users[at.targetHash];
    var destX = positions[destPlayer.playerNum].x;
    var destY = positions[destPlayer.playerNum].y;
     
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
        users[data.hash] = data; 
        socket.emit(Messages.H_Room_Update,users);
    });
    
    socket.on(Messages.H_Currency_Click, (hash) =>{
        users[hash].population += 1;
        users[hash].lastUpdate = new Date().getTime();
        socket.emit(Messages.H_Currency_Result,users[hash]);
    });
    
    socket.on(Messages.H_Attack_Click, (at) => { 
        if(!attacks.hasOwnProperty(at.hash))
            users[at.originHash].population -= 10;
        
        attacks[at.hash] = at;
        
        socket.emit(Messages.H_Attack_Update,attacks[at.hash]);
        attackIntervals[at.hash] = setInterval(updateAttack, 100, at.hash);
    });
}
