// Attack class
class Attack {
  constructor(hash, originHash, targetHash, originX, originY, color) {
    this.hash = hash;
    this.originHash = originHash;
    this.targetHash = targetHash;
    this.lastUpdate = new Date().getTime();
    this.x = originX;
    this.y = originY;
    this.width = 25;
    this.height = 25;
    this.color = color; 
    this.updateTick = 0;
  }
}

module.exports = Attack;
