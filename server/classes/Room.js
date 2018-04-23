class Room {
  constructor(name) {
    this.roomName = name;
    this.full = false;
    this.players = [];
    this.openSpaces = [undefined, undefined, undefined, undefined];
    this.hostSocketHash = undefined;
    Object.seal(this);
  }
}

module.exports = Room;
