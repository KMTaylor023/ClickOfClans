const lerp = (v0, v1, alpha) => {
  return (1 - alpha) * v0 + alpha * v1;
};


//redraw with requestAnimationFrame
const redraw = () => { 
  //clear screen
  ctx.clearRect(0, 0, 704, 704);
  ctx.fillStyle = "grey";
  ctx.fillRect(0,0,704,704);
  
  //draw players
  const keys = Object.keys(players); 
  for(let i = 0; i < keys.length; i++) {
    const player = players[keys[i]];
    
    let halfWidth = playerHalfWidth;
    let halfHeight = playerHalfHeight;
    
    //draw player
    if (player.skin != null){   //!= null to avoid a false if skin1 is had since its stored as value 0
        console.log("drawing player with skin " + player.skin);
        //get the skin url
        var skin = skins[player.skin];
        //draw the skin
        ctx.drawImage(skin, player.x, player.y, player.width, player.height);
    }
    else {
        //draw outer box
        ctx.fillStyle = player.color; 
        ctx.fillRect(player.x,player.y,player.width, player.height);

        // draw inner box
        ctx.fillStyle = "white";
        ctx.fillRect(player.x+5,player.y+5,player.width-10, player.height-10);
    }
    // draw their population count
    ctx.fillStyle = "black";
    ctx.fillText(player.population, player.x + halfWidth, player.y + halfHeight,100);  
    
    for(let j = 0; j < 3; j++){
      const str = player.structures[j];
      
      ctx.fillStyle = str.color;
      ctx.fillRect(str.x, str.y, str.width, str.height);
    }
  }
   
//get attacks
const attackKeys = Object.keys(attacks);

//if an amount of keys, draw the attacks
if (attackKeys.length > 0){
    //draw attacks
    for(let i = 0; i < attackKeys.length; i++) {
        let attack = attacks[attackKeys[i]];

        if(attack.alpha < 1) attack.alpha += 0.05;
        
        //lerp
        attack.x = lerp(attack.prevX, attack.destX, attack.alpha);
        attack.y = lerp(attack.prevY, attack.destY, attack.alpha);

        //draw
        ctx.fillStyle = attack.color;
        ctx.fillRect(attack.x - (attack.width/2), attack.y - (attack.height/2), attack.width, attack.height);
    }
  } 
   
};

const update = (time) => {
    redraw(); 
    
    animationFrame = requestAnimationFrame(update);
};