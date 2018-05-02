class Room {
  constructor(name) {
    this.roomName = name;
    this.full = false;
    this.players = [];
    this.openSpaces = [undefined, undefined, undefined, undefined];
    this.hostSocketHash = undefined;
    this.started = false;
    Object.seal(this);
  }
}

module.exports = Room;
