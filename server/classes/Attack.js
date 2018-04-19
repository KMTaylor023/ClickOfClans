// Attack class
class Attack {
  constructor(hash, originHash, targetHash, originX, originY, color) {
    this.hash = hash;
    this.originHash = originHash;
    this.targetHash = targetHash;
    this.lastUpdate = new Date().getTime();
    this.width = 25;
    this.height = 25;
    this.color = color;
    this.updateTick = 0;
    this.alpha = 0;
    this.damage = 2; // change to be 2*numberOfUnits
    // coords
    this.prevX = originX;
    this.prevY = originY;
    this.destX = originX;
    this.destY = originY;
    this.x = originX;
    this.y = originY;
    // this.moveX = moveX;
    // this.moveY = moveY;
  }
}

module.exports = Attack;
