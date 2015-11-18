/**
 * Class responsible for animating an objects position and rotation
 * linearly through the control points given
 * @class LinearAnimation
 * @extends Animation
 * @constructor
 * @module Animations
 * @param {String} id
 * @param {Float} time Time animation takes
 * @param {Array} controlPoints
 */
function LinearAnimation(id, time, controlPoints) {
    Animation.call(this, id, time);
    this.cp = controlPoints;
    this.pos = [];
}
LinearAnimation.prototype = Object.create(Animation.prototype);
LinearAnimation.prototype.constructor = LinearAnimation;

/**
 * Updates animation based on time passed
 * @method update
 * @param {Float} delta
 */
LinearAnimation.prototype.update = function(delta) {
    delta = delta / 1000;

    this.currTime = Math.min(this.time, this.currTime + delta);

    if (this.currTime == this.time) {
        this.done = true;
        return;
    }

    var nextPos = this.interp();

    // Calc rotations
    var dirVec = vec3.fromValues(nextPos[0] - this.pos[0],
        0,
        nextPos[2] - this.pos[2]);
    var rotAng;
    if (vec3.length(dirVec) > 0) {
        vec3.normalize(dirVec, dirVec);
        rotAng = Math.acos(vec3.dot(dirVec, vec3.fromValues(0, 0, 1)));
    } else rotAng = 0;

    var sign = dirVec[0] < 0 ? -1 : 1;
    rotAng *= sign;

    this.pos = nextPos;

    mat4.identity(this.matrix);
    mat4.translate(this.matrix, this.matrix, this.pos);
    mat4.rotateY(this.matrix, this.matrix, rotAng);

};

/**
 * Interpolates position between two control points
 * @method interp
 * @return {Array} interpPoint
 */
LinearAnimation.prototype.interp = function() {
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

/**
 * Basic method for linear interpolation
 * @method linearInterp
 * @param {Float} a
 * @param {Float} b
 * @param {Float} f
 * @return {Float} Interpolation
 */
function linearInterp(a, b, f) {
    return (a * (1.0 - f)) + (b * f);
}

/**
 * Clones the current animation object
 * @method clone
 * @return {LinearAnimation} clone
 */
LinearAnimation.prototype.clone = function() {
    return new LinearAnimation(this.id,
        this.time,
        this.cp);
};
