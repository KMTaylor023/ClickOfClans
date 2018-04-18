// Structure class
class Structure {
  constructor(originX, originY, type) {
    this.health = 100;
    this.x = 0;
    this.y = 0;
    this.width = 50;
    this.height = 50;
    this.type = type;
    this.color = "white";
    if (type == "farm"){
        this.color = "rgb(34,139,34)";
    }
    else if (type == "blacksmith"){
        this.color = "rgb(255,0,0)";
    }
    else{//shield
        this.color = "rgb(169,169,169)";
        this.health = 300;
    }
  }
}

module.exports = Structure;