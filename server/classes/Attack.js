// Attack class
class Attack {
  constructor(hash, originHash, targetHash, originX, originY, color, multiplier) {
    this.hash = hash;
    this.originHash = originHash;
    this.targetHash = targetHash;
    this.lastUpdate = new Date().getTime();
    this.width = 32;
    this.height = 32;
    this.color = color;
    this.updateTick = 0;
    this.alpha = 0;
    this.damage = 40 * multiplier;
    // coords
    this.prevX = originX;
    this.prevY = originY;
    this.destX = originX;
    this.destY = originY;
    this.x = originX;
    this.y = originY;
    this.moveX = 0;
    this.moveY = 0;
    this.lane = 0;
  }
}

module.exports = Attack;
