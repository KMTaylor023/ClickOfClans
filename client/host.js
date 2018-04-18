

const updateAttack = (hash) =>{
     
    var at = attacks[hash];  
    var originPlayer = users[at.originHash];
    var oX = positions[originPlayer.playerNum].x;
    var oY = positions[originPlayer.playerNum].y;
    var destPlayer = users[at.targetHash];
    var destX = positions[destPlayer.playerNum].x;
    var destY = positions[destPlayer.playerNum].y;
     
    var moveX = (destX - oX) / 10;
    var moveY = (destY - oY) / 10;   
    
    console.log(at);
    
    //at.x += moveX;
    //at.y += moveY;
    at.updateTick += 1; 
     
    if(at.updateTick > 10)
    {
        console.log("ALL DONE");
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
        console.log("SENDING NEW ATTACK");
        //const a = Object.assign({},at); 
        
        //console.log(a);
        const x = at.x;
        console.log(x);
        
        attacks[at.hash] = at;
        socket.emit(Messages.H_Attack_Update,attacks[at.hash]);
        setInterval(updateAttack, 5000, at.hash);
    });
}
