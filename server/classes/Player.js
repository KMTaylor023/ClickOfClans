// Character class
class Player {
  constructor(hash, name) {
    this.hash = hash;
    this.name = name;
    this.population = 0;
    this.lastUpdate = new Date().getTime();
    // x and y commented out atm, not sure if we are doing hardset x/ys on host side,
    // setting x and y after object exists, or if we want to pass the x and y values in
    // via constructor
    // this.x = Math.floor((Math.random() * 600) + 1); // x location on screen
    // this.y = Math.floor((Math.random() * 400) + 1); // y location on screen
    this.color = `rgb(${Math.floor((Math.random() * 255) + 1)},${Math.floor((Math.random() * 255) + 1)},${Math.floor((Math.random() * 255) + 1)})`;
  }
}

module.exports = Player;
