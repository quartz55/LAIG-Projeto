/**
 * Provides the animation classes
 * @module Animations
 * @main Animations
 */

/**
 * Base class for animations, extended by others
 * @class Animation
 * @constructor
 * @param {String} id
 * @param {Float} time Time animation takes
 */
function Animation(id, time) {
    this.id = id;
    this.time = time;
    this.currTime = 0;
    this.matrix = mat4.create();
    this.done = false;
    this._firstUpdate = true;
    this._doneHandlers = [];
}
Animation.prototype.constructor = Animation;

/**
 * Base method that updates the animation based on time passed.
 *
 * __NOTE__: Needs to be implemented by derived classes.
 * @method update
 * @param {Float} delta
 */
Animation.prototype.update = function(delta) {
    delta = delta / 1000;

    if (this._firstUpdate) this._firstUpdate = false;
    else this.currTime = Math.min(this.time, this.currTime + delta);

    if (this.currTime == this.time) {
        this.runHandlers();
        this.done = true;
        return;
    }
};

/**
 * Clones the current animation object.
 *
 * __NOTE__: Needs to be implemented by derived classes
 * @method clone
 * @return {Animation} clone
 */
Animation.prototype.clone = function() {};

/**
 * Resets animation
 * @method reset
 */
Animation.prototype.reset = function() {
    this.currTime = 0;
    this.done = false;
};

Animation.prototype.ondone = function(handler) {
    this._doneHandlers.push(handler);
};

Animation.prototype.runHandlers = function() {
    if (this._doneHandlers.length === 0) return;
    for (var h in this._doneHandlers) {
        this._doneHandlers[h]();
    }

    this._doneHandlers = [];
};
