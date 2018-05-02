const BARN_WAIT = 5;
var barnTime = BARN_WAIT;

//update attacks on the screen
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
    
    //determine number of dead players
    if (gameState === GameStates.GAME_PLAY){
        let numDead = 0;
        let potentialWinner;        //hash of the potential winner. won't change if only 1 player alive
        const keys = Object.keys(players); 
        for(let i = 0; i < keys.length; i++) {
            if (players[keys[i]].dead){
                numDead++;
            }
            else{
                potentialWinner = keys[i];
            }
        }

        //if only 1 player lives, end the game
        if (numDead === keys.length - 1){
            gameState = GameStates.GAME_OVER;
            socket.emit(Messages.H_State_Change, gameState);
            socket.emit(Messages.H_Winner, potentialWinner);
        }
    }
  
    //Farm check
    
    if(barnTime === BARN_WAIT) {
        barnTime = 0;
   
        const playKeys = Object.keys(players);
        for(let i = 0; i < playKeys.length; i++) {
            const player = players[playKeys[i]];
            let add = 0;
            for(let j = 0; j < 3; j++) {
                add += player.structures[j].popgen;
            }
            
            if(add !== 0) {
                users[player.hash].population += add;
                player.population += add;
                users[player.hash].lastUpdate = new Date().getTime();
                socket.emit(Messages.H_Currency_Result,users[player.hash]);
            }
        }
    } else barnTime ++;
}

//host socket listeners
const onHosted = () => { 
    setInterval(updateAttack,100);
    
    socket.isHost = true;
    
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
        players[data].ready = true;
        
        //check if all players are ready
        const keys = Object.keys(players); 
        if (keys.length > 1){   //make sure the host doesnt start the game when alone
            for(let i = 0; i < keys.length; i++) {
                //if at least 1 player isnt ready, exit this method
                if (!players[keys[i]].ready){
                    return;
                }
            }

            //all players are ready, update the game state
            gameState = GameStates.GAME_PLAY;
            socket.emit(Messages.H_State_Change, gameState);
            socket.emit(Messages.H_Started);
        }
        
    });
  
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
    });
    
    socket.on(Messages.H_Currency_Click, (hash) =>{
        players[hash].population += 1;
        users[hash].population = players[hash].population;
        users[hash].lastUpdate = new Date().getTime();
        socket.emit(Messages.H_Currency_Result,users[hash]);
    });
    
    const doFortify = (data) => {
        const dat = data;
        if(players[data.hash].population >= 31 && 
           players[data.hash].structures[data.which].health < players[data.hash].structures[data.which].maxhealth) {
            players[data.hash].structures[data.which].health += 30;
            if(players[data.hash].structures[data.which].health > players[data.hash].structures[data.which].maxhealth)
                players[data.hash].structures[data.which].health = players[data.hash].structures[data.which].maxhealth
            players[data.hash].population -= 30;
            users[data.hash].population = players[data.hash].population;
            dat.health = players[data.hash].structures[data.which].health;
            socket.emit(Messages.H_Fortified, dat);
        }
    }
    
    socket.on(Messages.H_Attack_Click, (at) => { 
        //make sure originplayer can afford to attack and the target isn't dead
        var originPlayer = players[at.originHash];
        var destPlayer = players[at.targetHash];
        if (originPlayer.population >= 31 && !destPlayer.dead){
            //make sure origin player cant spawn attacks that would bring them to negative population
            
            
            
            //store the attack
            attacks[at.hash] = at;

            // set the moveX and the moveY of the attack
            var oX = originPlayer.x + playerHalfWidth;
            var oY = originPlayer.y + playerHalfHeight;
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
          
            
            if(originPlayer.structures[attacks[at.hash].lane].type === STRUCTURE_TYPES.SHIELD) {
                doFortify({hash: originPlayer.hash, which:attacks[at.hash].lane});
                delete attacks[at.hash];
            } else {
                originPlayer.population -= 30;
                users[at.originHash].population = originPlayer.population;
                // emit
                socket.emit(Messages.H_Attack_Create,attacks[at.hash]); 
            }
        }
        
        
    });
  
    socket.on(Messages.H_Purchase_Structure, (data) => {  
      // Make sure the cost is right 
      if(players[data.hash].population >= data.cost) 
        players[data.hash].population -= data.cost;
        users[data.hash].population = players[data.hash].population;
        socket.emit(Messages.H_Purchase_Structure_Result,data);
    });
    
    socket.on(Messages.H_Fortify, (data) => {
        doFortify(data)
    });
}
