// Attack class
class Attack {
  constructor(hash, originHash, targetHash, originX, originY, color) {
    this.hash = hash;
    this.originHash = originHash;
    this.targetHash = targetHash;
    this.lastUpdate = new Date().getTime();
    this.x = 0;
    this.y = 0;
    this.width = 25;
    this.height = 25;
    this.color = color;
    this.updateTick = 0;
    this.alpha = 0;
  }
}

module.exports = Attack;
