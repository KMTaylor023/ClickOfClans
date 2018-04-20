const STRUCTURE_TYPES = {
  FARM: 'farm',
  BSMITH: 'blacksmith',
  SHIELD: 'shield',
};

const INFO = {};

//the stats for the farm
INFO[STRUCTURE_TYPES.FARM] = {
  health: 50,
  color: 'rgb(34,139,34)',
  popgen: 2,
  atkmult: 1,
  defmult: 1,
};

//the stats for the blacksmith
INFO[STRUCTURE_TYPES.BSMITH] = {
  health: 100,
  color: 'rgb(255,0,0)',
  popgen: 0,
  atkmult: 2,
  defmult: 1,
};

//the stats for the shield
INFO[STRUCTURE_TYPES.SHIELD] = {
  health: 300,
  color: 'rgb(169,169,169)',
  popgen: 0,
  atkmult: 1,
  defmult: 2,
};

//deals damage to structure
const takeDamage = (dmg, isBonus) => {
  this.health -= dmg/this.defmult;
  if (this.health < 0){
    this.health = 0;
    this.destroyed = true;
  }
};

// Structure class
class Structure {
  constructor(x, y, type) {
    this.x = x;
    this.y = y;
    this.type = type;
    
    
    const inf = INFO[type];
    
    this.color = inf.color;
    this.health = inf.health;
    this.popgen = inf.popgen;
    this.atkmult = inf.atkmult;
    this.defmult = inf.defmult;
    this.destroyed = false;
    
    this.takeDamage = takeDamage.bind(this);
  }
};

module.exports.newStructure = Structure;
module.exports.type = STRUCTURE_TYPES;
