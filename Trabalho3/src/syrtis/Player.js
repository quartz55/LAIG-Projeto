function Player(player) {
    this.type = player.type;
    this.color = player.color;
    this.passes = player.passes;
    this.sinks = player.sinks;
}

Player.prototype.stringify = function() {
    return String.format("[{0},{1},{2},{3}]",
                         this.type, this.color, this.passes, this.sinks);
};
