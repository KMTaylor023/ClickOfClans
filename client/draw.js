const lerp = (v0, v1, alpha) => {
  return (1 - alpha) * v0 + alpha * v1;
};

const positions = [ 
    { x: 100, y: 100} , 
    { x: 600, y: 400} , 
    { x: 100, y: 400} , 
    { x: 600, y: 100}]; 
const colors = ["red","blue","yellow","green"];


//redraw with requestAnimationFrame
const redraw = () => { 
  //clear screen
  ctx.clearRect(0, 0, 700, 500);
  ctx.fillStyle = "grey";
  ctx.fillRect(0,0,700,500);
  
  //draw players
  const keys = Object.keys(users); 
  for(let i = 0; i < keys.length; i++) {
    const player = users[keys[i]];
    
    let halfWidth = player.width/2;
    let halfHeight = player.height/2;
    let posX = positions[player.playerNum].x - halfWidth;
    let posY = positions[player.playerNum].y - halfHeight;
      
    //draw outer box
    ctx.fillStyle = colors[player.playerNum]; 
    ctx.fillRect(posX,posY,player.width, player.height);
    
    // draw inner box
    ctx.fillStyle = "white";
    ctx.fillRect(posX+5,posY+5,player.width-10, player.height-10);
 
    // draw their population count
    ctx.fillStyle = "black";
    ctx.fillText(player.population, posX + halfWidth, posY + halfHeight,100);  
  }
   
//get attacks
const attackKeys = Object.keys(attacks);

//if an amount of keys, draw the attacks
if (attackKeys.length > 0){
    //draw attacks
    for(let i = 0; i < attackKeys.length; i++) {
        let attack = attacks[attackKeys[i]];

        if(attack.alpha < 1) attack.alpha += 0.05;
       
        //consol
        //lerp
        //attack.x = lerp(attack.prevX, attack.destX, attack.alpha);
        //attack.y = lerp(attack.prevY, attack.destY, attack.alpha);

        //draw
        ctx.fillStyle = attack.color;
        ctx.fillRect(attack.x, attack.y, attack.width, attack.height);
    }
  } 
   
};

const update = (time) => {
    redraw(); 
    
  animationFrame = requestAnimationFrame(update);
};