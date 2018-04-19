// Character class
class Player {
  constructor(hash, name) {
    this.hash = hash;
    this.name = name;
    this.population = 0;
    this.lastUpdate = new Date().getTime();
    // not sure if we are doing hardset x/ys on host side,
    // setting x and y after object exists, or if we want to pass the x and y values in
    // via constructor
    this.x = 0; // x location on screen
    this.y = 0; // y location on screen
    this.playerNum = 0;
    this.width = 100;
    this.height = 100;
    this.color = `rgb(${Math.floor((Math.random() * 255) + 1)},${Math.floor((Math.random() * 255) + 1)},${Math.floor((Math.random() * 255) + 1)})`;
    // structures array: position 0 = horizontal lane, position 1 = diagonal lane,
    // position 3 = vertical lane
    this.structures = [null, null, null];
  }
}

module.exports = Player;
