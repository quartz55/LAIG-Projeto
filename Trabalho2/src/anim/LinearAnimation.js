function LinearAnimation(id, time, controlPoints) {
    Animation.call(this, id, time);
    this.cp = controlPoints;
    this.pos = [];
}
LinearAnimation.prototype = Object.create(Animation.prototype);
LinearAnimation.prototype.constructor = LinearAnimation;

LinearAnimation.prototype.update = function(delta) {
    delta = delta/1000;
    if (this.currTime <= this.time - delta)
        this.currTime += delta;
    else if (this.currTime + delta >= this.time && this.currTime != this.time)
        this.currTime = this.time;
    else return;

    var nextPos = this.interp();

    // Calc rotations
    var dirVec = vec3.fromValues(nextPos[0]-this.pos[0],
                                 nextPos[1]-this.pos[1],
                                 nextPos[2]-this.pos[2]);
    vec3.normalize(dirVec, dirVec);

    this.pos = nextPos;

    mat4.identity(this.matrix);
    mat4.translate(this.matrix, this.matrix, this.pos);

};

LinearAnimation.prototype.interp = function() {
    var deltaTimeCP = this.time / (this.cp.length-1);

    var currCPIndex = Math.floor(this.currTime/deltaTimeCP);
    var nextCPIndex = Math.ceil(this.currTime/deltaTimeCP);

    var currCP = this.cp[currCPIndex];
    var nextCP = this.cp[nextCPIndex];

    var f = (this.currTime - Math.floor(this.currTime / deltaTimeCP) * deltaTimeCP) / deltaTimeCP;
    var interpPoint = [];
    interpPoint[0] = linearInterp(currCP[0], nextCP[0], f);
    interpPoint[1] = linearInterp(currCP[1], nextCP[1], f);
    interpPoint[2] = linearInterp(currCP[2], nextCP[2], f);

    return interpPoint;
};

function linearInterp(a, b, f) {
    return (a * (1.0-f)) + (b * f);
}
