 

const updateAttack = () =>{  
    var returnMe = {};
    
    let arOfHashes = Object.keys(attacks);
    for(var i = 0; i < arOfHashes.length; i++)
    {
        let at = attacks[arOfHashes[i]]; 
        var newX = at.destX + at.moveX;
        var newY = at.destY + at.moveY;
        var newTick = at.updateTick + 1;
        
        if(newTick > 100) 
            socket.emit(Messages.H_Attack_Hit,attacks[arOfHashes[i]]); 
        else 
            returnMe[i] = {hash: arOfHashes[i], x: newX, y: newY, tick: newTick}; 
    }
    
    socket.emit(Messages.H_Attack_Update,returnMe);
     
}

const onHosted = () => { 
    document.querySelector("#debug").style.display = "block";
    setInterval(updateAttack,100);
    
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
        
        // set the moveX and the moveY of the attack
        var originPlayer = players[at.originHash];
        var oX = originPlayer.x + playerHalfWidth;
        var oY = originPlayer.y + playerHalfHeight;
        var destPlayer = players[at.targetHash];
        var destX = destPlayer.x + playerHalfWidth;
        var destY = destPlayer.y + playerHalfHeight;

        var moveX = (destX - oX) / 100;
        var moveY = (destY - oY) / 100;   
        
        attacks[at.hash].moveX = moveX;
        attacks[at.hash].moveY = moveY;
        
        // emit
        socket.emit(Messages.H_Attack_Create,attacks[at.hash]); 
    });
}
