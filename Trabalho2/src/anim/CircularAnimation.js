function CircularAnimation(id, time, center, rad, iang, rang) {
    Animation.call(this, id, time);
    this.center = center;
    this.rad = rad;
    this.iang = iang;
    this.rang = rang;

    this.initMatrix = mat4.create();
    mat4.identity(this.initMatrix);
    mat4.rotateY(this.initMatrix, this.initMatrix, this.iang);
    mat4.translate(this.initMatrix, this.initMatrix, vec3.fromValues(0, 0, this.rad));
    mat4.rotateY(this.initMatrix, this.initMatrix, this.rang > 0 ? Math.PI/2 : -Math.PI/2);
}
CircularAnimation.prototype = Object.create(Animation.prototype);
CircularAnimation.prototype.constructor = CircularAnimation;

CircularAnimation.prototype.update = function(delta) {
    delta = delta/1000;

    this.currTime = Math.min(this.time, this.currTime + delta);
    if (this.currTime == this.time) {
        this.done = true;
        return;
    }

    mat4.identity(this.matrix);

    mat4.translate(this.matrix, this.matrix, this.center);

    var rotAng = this.rang * (this.currTime/this.time);
    mat4.rotateY(this.matrix, this.matrix, rotAng);

    mat4.multiply(this.matrix, this.matrix, this.initMatrix);
};
