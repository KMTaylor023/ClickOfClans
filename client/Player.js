const positions = [ 
    { x: 48, y: 48} , 
    { x: 560, y: 560} , 
    { x: 48, y: 560} , 
    { x: 560, y: 48}]; 

const structure_positions = [
  [{x:192, y: 64}, {x: 192, y: 192}, {x: 64, y: 192}],
  [{x:448, y: 576}, {x: 448, y: 448}, {x: 576, y: 448}],
  [{x:64, y: 448}, {x: 192, y: 448}, {x: 192, y: 576}],
  [{x:448, y: 64}, {x: 448, y: 192}, {x: 576, y: 192}]];
const colors = ["red","blue","yellow","green"];
const playerWidth = 96;
const playerHeight = 96;
const playerHalfWidth = playerWidth/2;
const playerHalfHeight = playerHeight/2;

const STRUCTURE_TYPES = {
  FARM: 'farm',
  BSMITH: 'blacksmith',
  SHIELD: 'shield',
  PLACEHOLDER: 'placeholder',
};

const INFO = {};

//the stats for the farm
INFO[STRUCTURE_TYPES.FARM] = {
  health: 50,
  maxhealth: 50,
  color: 'rgb(34,139,34)',
  popgen: 2,
  atkmult: 1,
  defmult: 1,
  onClick: () => {
    
  },
};

//the stats for the blacksmith
INFO[STRUCTURE_TYPES.BSMITH] = {
  health: 100,
  maxhealth: 100,
  color: 'rgb(255,0,0)',
  popgen: 0,
  atkmult: 2,
  defmult: 1,
  onClick: () => {
    
  },
};

//the stats for the shield
INFO[STRUCTURE_TYPES.SHIELD] = {
  health: 300,
  maxhealth: 300,
  color: 'rgb(169,169,169)',
  popgen: 0,
  atkmult: 1,
  defmult: 2,
  onClick: () => {
    
  },
};

//the stats for the shield
INFO[STRUCTURE_TYPES.PLACEHOLDER] = {
  health: 0,
  maxhealth: 0,
  color: 'rgb(70,70,70)',
  popgen: 0,
  atkmult: 1,
  defmult: 1,
  onClick: (xPos, struct) => {
    if(xPos < struct.width / 3) {
      struct.setup(STRUCTURE_TYPES.SHIELD);
    } else if(xPos > 2 * (struct.width / 3)) {
      struct.setup(STRUCTURE_TYPES.BSMITH);
    } else {
      struct.setup(STRUCTURE_TYPES.FARM);
    }
  },
};



// Structure class
class Structure {
  constructor(x, y, type) {
    this.x = x;
    this.y = y;
    
    this.width = 64;
    this.height = 64;
    
    this.setup(type);
  }
  
  setup(type) {
    this.type = type;
    
    const inf = INFO[type];
    
    this.color = inf.color;
    this.health = inf.health;
    this.maxhealth = inf.maxhealth;
    this.popgen = inf.popgen;
    this.atkmult = inf.atkmult;
    this.defmult = inf.defmult;
    this.destroyed = false;
    
    this.onClick = inf.onClick;
  }
  
  reset() {
    setup(STRUCTURE_TYPES.PLACEHOLDER);
  }
  
  //deals damage to structure
  takeDamage(dmg, isBonus) {
    this.health -= dmg/this.defmult;
    if (this.health < 0){
      this.health = 0;
      this.destroyed = true;
    }
  }
};

// Character class
class Player {
  constructor(hash, name, playerNum, skin) {
    this.hash = hash;
    this.name = name;
    this.population = 0;
    this.lastUpdate = new Date().getTime();
    // not sure if we are doing hardset x/ys on host side,
    // setting x and y after object exists, or if we want to pass the x and y values in
    // via constructor
    this.x = positions[playerNum].x; // x location on screen
    this.y = positions[playerNum].y; // y location on screen
    this.playerNum = playerNum;
    this.width = playerWidth;
    this.height = playerHeight;
    //this.color = `rgb(${Math.floor((Math.random() * 255) + 1)},${Math.floor((Math.random() * 255) + 1)},${Math.floor((Math.random() * 255) + 1)})`;
    this.color = colors[playerNum];
    // structures array: position 0 = horizontal lane, position 1 = diagonal lane,
    // position 3 = vertical lane
    this.structures = [];
    this.skin = skin;       //has an int if the player equips a skin, otherwise null
    this.ready = false;     //did the player ready up
    this.dead = false;      //did the player die?
    
    const strPos = structure_positions[playerNum];
    
    for(let i = 0; i < 3; i++){
      this.structures[i] = new Structure(strPos[i].x,strPos[i].y,STRUCTURE_TYPES.PLACEHOLDER);
    }
  }
}
