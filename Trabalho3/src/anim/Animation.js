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
}
Animation.prototype.constructor = Animation;

/**
 * Base method that updates the animation based on time passed.
 *
 * __NOTE__: Needs to be implemented by derived classes.
 * @method update
 * @param {Float} delta
 */
Animation.prototype.update = function(delta) {};

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
