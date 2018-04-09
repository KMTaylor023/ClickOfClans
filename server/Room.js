class Room {
  constructor(name) {
    this.roomName = name;
    this.full = false;
    this.players = [];
    Object.seal(this);
  }
};

module.exports = Room;