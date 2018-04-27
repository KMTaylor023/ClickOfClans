 

const updateAttack = () =>{  
    var returnMe = {};
    
    let arOfHashes = Object.keys(attacks);
    for(var i = 0; i < arOfHashes.length; i++)
    {
        let at = attacks[arOfHashes[i]]; 
        var newX = at.destX + at.moveX;
        var newY = at.destY + at.moveY;
        var newTick = at.updateTick + 1;
        
        
        if(newTick >= 70 && newTick <= 75)
        {
            // Check to see if we can hit anything on the structure
            var destPlayer = players[at.targetHash];
            console.log(destPlayer);
            if(destPlayer.structures[at.lane].type !== STRUCTURE_TYPES.PLACEHOLDER){
                socket.emit(Messages.H_Attack_Struct, {hash: arOfHashes[i], lane: at.lane, dest: at.targetHash}); 
                continue;
            }
            
        }
        
        if(newTick > 100) 
            socket.emit(Messages.H_Attack_Hit,at); 
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
        const player = new Player(data.hash, data.name, data.playerNum, data.skin);
        data.lastUpdate = player.lastUpdate;
        data.population = player.population;
        users[data.hash] = data; 
        players[data.hash] = player;
        socket.emit(Messages.H_Room_Update,users);
        //make sure everyone has the same game state
        socket.emit(Messages.H_State_Change, gameState);
    });
    
    socket.on(Messages.H_Ready, (data) => {
        //ready that player
        players[data.hash].ready = true;
        
        //check if all players are ready
        const keys = Object.keys(players); 
        for(let i = 0; i < keys.length; i++) {
            //if at least 1 player isnt ready, exit this method
            if (!players[keys[i]].ready){
                return;
            }
        }
        
        //all players are ready, update the game state
        gameState = GameStates.GAME_PLAY;
        socket.emit(Messages.H_State_Change, gameState);
    })
  
    socket.on(Messages.H_Player_Left, (data) => {
        delete users[data.hash];
        delete players[data.hash]
        
        if(gameState === GameStates.READY_UP){
            const keys = Object.keys(players); 
            let ready = true;
            for(let i = 0; i < keys.length; i++) {
                //if at least 1 player isnt ready, exit this method
                if (!players[keys[i]].ready){
                    ready = false;;
                }
            }
            
            if(ready) {
                gameState = GameStates.GAME_PLAY;
                socket.emit(Messages.H_State_Change, gameState);
            }
        }
    })
    
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
        
        // now get the lane we're in
        if(moveX === 0)
            attacks[at.hash].lane = 2;
        else if(moveY === 0)
            attacks[at.hash].lane = 0;
        else 
            attacks[at.hash].lane = 1;
        
        // emit
        socket.emit(Messages.H_Attack_Create,attacks[at.hash]); 
    });
  
    socket.on(Messages.H_Purchase_Structure, (data) => {
      
    })
}
