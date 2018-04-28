//sizes of the images to cut out from the main image
const spriteSizes = {
  PLAYER_WIDTH: 96,
  PLAYER_HEIGHT: 96,
  STRUCTURE_WIDTH: 64,
  STRUCTURE_HEIGHT: 64,
  UNSPAWNED_STRUCTURE_WIDTH: 96,
  UNSPAWNED_STRUCTURE_HEIGHT: 96,
};

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
        
        // draw their population count
        ctx.fillStyle = "blue";
        ctx.fillText(player.population, player.x + halfWidth, player.y + halfHeight,100); 
    }
    else {
        ctx.drawImage(
          playerImage, 
          spriteSizes.PLAYER_WIDTH * i,
          0,
          spriteSizes.PLAYER_WIDTH, 
          spriteSizes.PLAYER_HEIGHT,
          player.x, 
          player.y, 
          player.width, 
          player.height
        );
        
        // draw their population count
        ctx.fillStyle = "black";
        ctx.fillText(player.population, player.x + halfWidth, player.y + halfHeight,100);  
    }
    
    
    for(let j = 0; j < 3; j++){
      const str = player.structures[j];
      
      //check structure type
      if (str.type === STRUCTURE_TYPES.PLACEHOLDER){
          ctx.drawImage(
              unbuiltStructureImage, 
              spriteSizes.UNSPAWNED_STRUCTURE_WIDTH * i,
              0,
              spriteSizes.UNSPAWNED_STRUCTURE_WIDTH, 
              spriteSizes.UNSPAWNED_STRUCTURE_HEIGHT,
              str.x, 
              str.y, 
              str.width, 
              str.height
          );
      }
      else if (str.type === STRUCTURE_TYPES.FARM){
          ctx.drawImage(
              farmImage, 
              spriteSizes.STRUCTURE_WIDTH * i,
              0,
              spriteSizes.STRUCTURE_WIDTH, 
              spriteSizes.STRUCTURE_HEIGHT,
              str.x, 
              str.y, 
              str.width, 
              str.height
          );
      }
      else if (str.type === STRUCTURE_TYPES.SHIELD){
          ctx.drawImage(
              shieldImage, 
              spriteSizes.STRUCTURE_WIDTH * i,
              0,
              spriteSizes.STRUCTURE_WIDTH, 
              spriteSizes.STRUCTURE_HEIGHT,
              str.x, 
              str.y, 
              str.width, 
              str.height
          );
      }
      else{
          ctx.drawImage(
              blacksmithImage, 
              spriteSizes.STRUCTURE_WIDTH * i,
              0,
              spriteSizes.STRUCTURE_WIDTH, 
              spriteSizes.STRUCTURE_HEIGHT,
              str.x, 
              str.y, 
              str.width, 
              str.height
          );
      }
      
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
    
    //if ready up, draw the readyup button
    if (gameState === GameStates.READY_UP){
        ctx.drawImage(readyButton.image, readyButton.x, readyButton.y, readyButton.width, readyButton.height);
    }
    else if (gameState === GameStates.GAME_OVER){
        //draw return to lobby button
        ctx.drawImage(leaveButton.image, leaveButton.x, leaveButton.y, leaveButton.width, leaveButton.height);
    }
   
};

const update = (time) => {
    redraw(); 
    
    animationFrame = requestAnimationFrame(update);
};