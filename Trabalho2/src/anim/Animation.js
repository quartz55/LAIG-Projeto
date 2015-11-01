function Animation(id, time) {
    this.id = id;
    this.time = time;
    this.currTime = 0;
    this.matrix = mat4.create();
}
Animation.prototype.constructor = Animation;

Animation.prototype.update = function(delta) {};

Animation.prototype.reset = function() {
    this.currTime = 0;
};
