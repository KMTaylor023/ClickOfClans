//sizes of the images to cut out from the main image
const spriteSizes = {
  PLAYER_WIDTH: 96,
  PLAYER_HEIGHT: 96,
  STRUCTURE_WIDTH: 64,
  STRUCTURE_HEIGHT: 64,
  UNSPAWNED_STRUCTURE_WIDTH: 96,
  UNSPAWNED_STRUCTURE_HEIGHT: 96,
};

//lerp the attack sprites
const lerp = (v0, v1, alpha) => {
  return (1 - alpha) * v0 + alpha * v1;
};


//redraw with requestAnimationFrame
const redraw = () => { 
  //clear screen
  ctx.clearRect(0, 0, 704, 704);
  ctx.drawImage(fieldBg,0,0,704,704,0,0,704,704); 
  
  //draw players
  const keys = Object.keys(players); 
  for(let i = 0; i < keys.length; i++) {
    const player = players[keys[i]];
    
    let halfWidth = playerHalfWidth;
    let halfHeight = playerHalfHeight;
    
    //draw player
    if (player.skin != null){   //!= null to avoid a false if skin1 is had since its stored as value 0 
        // If it's you, put a nice tab over your castle that labels you as you
        if(player.hash === myHash)
        {
            ctx.save(); 
            ctx.drawImage(pannelImage,
                          64 * player.playerNum,
                          0,
                          64,
                          32,
                          player.x + 16,
                          player.y - 16,
                          64,
                          32);
            ctx.textAlign = "center";
            ctx.fillStyle = "black";
            ctx.font="15px Do Hyeon";
            ctx.fillText("YOU",player.x + 48, player.y-4,100);
            ctx.restore();
        }
        
        //get the skin url
        var skin = skins[player.skin];
        //draw the skin
        ctx.drawImage(skin, player.x, player.y, player.width, player.height);
        
        // draw their population count
        ctx.save();
        ctx.fillStyle = "#00BFFF";
        ctx.textAlign = "center";
        ctx.font="28px Do Hyeon";
        ctx.fillText(player.population, player.x + halfWidth, player.y + halfHeight + 10,100);
        ctx.restore();
    }
    else {
        
        // If it's you, put a nice tab over your castle that labels you as you
        if(player.hash === myHash)
        {
            ctx.save(); 
            ctx.drawImage(pannelImage,
                          64 * player.playerNum,
                          0,
                          64,
                          32,
                          player.x + 16,
                          player.y - 16,
                          64,
                          32);
            ctx.textAlign = "center";
            ctx.fillStyle = "black";
            ctx.font="15px Do Hyeon";
            ctx.fillText("YOU",player.x + 48, player.y-4,100);
            ctx.restore();
        }
        
        
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
        ctx.save();
        ctx.textAlign="center"; 
        ctx.fillStyle = "black";
        ctx.font="28px Do Hyeon";
        ctx.fillText(player.population, player.x + halfWidth, player.y + halfHeight + 10,100);
        ctx.restore();
    }
    
    //if the player is dead, draw skull over them
    if (player.dead){
        ctx.save();
        ctx.alpha = 0.7;
        ctx.drawImage(skullImage, player.x, player.y, player.width, player.height);
        ctx.restore();
    }
    
    
    for(let j = 0; j < 3; j++){
      const str = player.structures[j];
      
      if(str.type != STRUCTURE_TYPES.PLACEHOLDER){ 
        ctx.save(); 
        ctx.drawImage(
            pannelImage2,
            48*player.playerNum,
            0,48,48,
            str.x+8,
            str.y+32,
            48,48);
          
        ctx.fillStyle = "black"; 
        ctx.textAlign="center";
        ctx.font="12px Do Hyeon";
        ctx.fillText(str.health + "/" +  str.maxhealth,str.x+32,str.y+76,100);
        ctx.restore();
      }
        
      //check structure type
      if (str.type === STRUCTURE_TYPES.PLACEHOLDER){
          ctx.drawImage(
              emptyLotImage, 
              spriteSizes.STRUCTURE_WIDTH * i,
              0,
              spriteSizes.STRUCTURE_WIDTH, 
              spriteSizes.STRUCTURE_HEIGHT,
              str.x, 
              str.y, 
              str.width, 
              str.height
          );
           
          if(selectedLotIndex === j && player.hash === myHash)
          { 
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
      if (player.dead){
        ctx.save();
        ctx.alpha = 0.7;
        ctx.drawImage(skullImage, str.x, str.y, str.width, str.height);
        ctx.restore();
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
            ctx.drawImage(
                attackImage,
                32 * players[attack.originHash].playerNum,
                0,
                32,
                32,
                attack.x - (attack.width/2),
                attack.y - (attack.height/2),
                attack.width,
                attack.height
            ); 
        }
    }
    
    //if ready up, draw the readyup button
    if (gameState === GameStates.READY_UP){
        ctx.drawImage(readyButton.image, readyButton.x, readyButton.y, readyButton.width, readyButton.height);
        
        ctx.save();
        ctx.textAlign = "center";
        ctx.fillStyle = "black";
        ctx.font = "20px Do Hyeon";
        ctx.fillText("Ready Up!",352,387,200);
        ctx.restore();
    }
    else if (gameState === GameStates.GAME_OVER){
        //draw the winner
        ctx.save();
        ctx.fillStyle = "white";
        ctx.drawImage(
            winnersBG,
            200 * winner,
            0,
            200,
            60,
            250,
            250,
            200,
            60);
        //ctx.fillRect(300, 200, 100, 40);
        ctx.fillStyle = "black";
        ctx.font="30px Do Hyeon";
        ctx.textAlign = "center";
        ctx.fillText("Player " + winner + " wins!", 352, 280,250);
        ctx.restore();
        
        //draw return to lobby button
        ctx.drawImage(leaveButton.image, leaveButton.x, leaveButton.y, leaveButton.width, leaveButton.height);
    }
   
};

//update the screen
const update = (time) => {
    redraw(); 
    
    animationFrame = requestAnimationFrame(update);
};