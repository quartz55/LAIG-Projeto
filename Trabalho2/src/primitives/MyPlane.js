/**
 * Primitive that represents a plane with the divisions specified
 * @class MyPlane
 * @extends CGFnurbsObject
 * @constructor
 * @module Primitives
 * @param {CGFscene} scene
 * @param {Array} args
 */
function MyPlane(scene, args) {
    this.args = args || [20];
    this.nrParts = this.args[0];

    var nurbsSurface = new CGFnurbsSurface(1, 1, [0, 0, 1, 1], [0, 0, 1, 1], [
        [
            [0.5, 0, -0.5, 1],
            [0.5, 0, 0.5, 1]
        ],
        [
            [-0.5, 0, -0.5, 1],
            [-0.5, 0, 0.5, 1, 1]
        ]
    ]);
    var getSurfacePoint = function(u, v) {
        return nurbsSurface.getPoint(u, v);
    };

    CGFnurbsObject.call(this, scene, getSurfacePoint, this.nrParts, this.nrParts);
}

MyPlane.prototype = Object.create(CGFnurbsObject.prototype);
MyPlane.prototype.constructor = MyPlane;

/**
 * Updates the texture coordinates of the primitive
 * @method updateTex
 * @param {Float} S
 * @param {Float} T
 */
MyPlane.prototype.updateTex = function(ampS, ampT) {};
