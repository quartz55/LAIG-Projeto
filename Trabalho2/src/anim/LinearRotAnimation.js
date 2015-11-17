function LinearRotAnimation(id, time, rot, controlPoints) {
    Animation.call(this, id, time);
	this.rotate = rot;
    this.cp = controlPoints;
    this.pos = [];
}
LinearRotAnimation.prototype = Object.create(Animation.prototype);
LinearRotAnimation.prototype.constructor = LinearRotAnimation;

LinearRotAnimation.prototype.update = function(delta) {
    delta = delta / 1000;

    this.currTime = Math.min(this.time, this.currTime + delta);

    if (this.currTime == this.time) {
        this.done = true;
        return;
    }

    var nextPos = this.interp();

    var rotAng = (this.currTime*this.rotate) / this.time;
    this.pos = nextPos;

    mat4.identity(this.matrix);
    mat4.translate(this.matrix, this.matrix, this.pos);
    mat4.rotateY(this.matrix, this.matrix, rotAng);

};

LinearRotAnimation.prototype.interp = function() {
    var deltaTimeCP = this.time / (this.cp.length - 1);

    var currCPIndex = Math.floor(this.currTime / deltaTimeCP);
    var nextCPIndex = Math.ceil(this.currTime / deltaTimeCP);

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
    return (a * (1.0 - f)) + (b * f);
}

LinearRotAnimation.prototype.clone = function() {
    return new LinearRotAnimation(this.id,
        this.time,
		this.rotate,
        this.cp);
};
