const lerp = (v0, v1, alpha) => {
  return (1 - alpha) * v0 + alpha * v1;
};

//redraw with requestAnimationFrame
const redraw = (time) => { 
  //clear screen
  ctx.clearRect(0, 0, 700, 500);
  
  //draw players
  const keys = Object.keys(users);
  for(let i = 0; i < keys.length; i++) {
    const player = players[keys[i]];
      
    //draw
    ctx.fillStyle = player.color;
    ctx.fillRect(player.x, player.y, player.width, player.height);
  }
    
    //get attacks
    const attackKeys = Object.keys(users);
    
    //if an amount of keys, draw the attacks
    if (attackKeys.length > 0){
        //draw attacks
        for(let i = 0; i < keys.length; i++) {
            let attack = attacks[attackKeys[i]];
            
            if(attack.alpha < 1) attack.alpha += 0.05;
            //lerp
            attack.x = lerp(attack.prevX, attack.destX, attack.alpha);
            player.y = lerp(attack.prevY, attack.destY, attack.alpha);
            
            //draw
            ctx.fillStyle = attack.color;
            ctx.fillRect(attack.x, attack.y, attack.width, attack.height);
        }
  }
  
  
  animationFrame = requestAnimationFrame(redraw);
};