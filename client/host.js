

const updateAttack = (hash) =>{
    
    let attack = attacks[hash];
    let originPlayer = users[attack.originHash];
    let oX = positions[originPlayer.playerNum].x;
    let oY = positions[originPlayer.playerNum].y;
    let destPlayer = users[attack.targetHash];
    let destX = positions[destPlayer.playerNum].x;
    let destY = positions[destPlayer.playerNum].y;
    
    let moveX = (destX - oX) / 10;
    let moveY = (destY - oY) / 10;
    
    attack.x += moveX;
    attack.y += moveY;
    attack.updateTick += 1;
     
    if(attack.updateTick > 10)
    {
        console.log("ALL DONE");
    }else
        socket.emit(Messages.H_Attack_Update,attacks[hash]);
}

const onHosted = () => { 
    document.querySelector("#debug").style.display = "block";
     
    socket.on(Messages.H_Player_Joined, (data) => { 
        // Add a new user
        console.log("Added user: " + data.hash);  
        users[data.hash] = data; 
        socket.emit(Messages.H_Room_Update,users);
    });
    
    socket.on(Messages.H_Currency_Click, (hash) =>{
        users[hash].population += 1;
        users[hash].lastUpdate = new Date().getTime();
        socket.emit(Messages.H_Currency_Result,users[hash]);
    });
    
    socket.on(Messages.H_Attack_Click, (attack) => {
        attacks[attack.hash] = attack;
        socket.emit(Messages.H_Attack_Update,attacks);
        setInterval(updateAttack(attack.hash), 500);
    });
}
