/**
 * Primitive that represents a cube
 * @class MyCube
 * @extends CGFobject
 * @constructor
 * @module Primitives
 * @param {CGFscene} scene
 */
function MyCube(scene) {
    CGFobject.call(this,scene);

    this.quad = new MyQuad(scene, null);
}

MyCube.prototype = Object.create(CGFobject.prototype);
MyCube.prototype.constructor=MyCube;

/**
 * Method that renders the primitive to the WebGL context
 * @method display
 */
MyCube.prototype.display = function() {
    this.scene.pushMatrix();
    this.scene.translate(0,0,0.5);
    this.displayQuad();
    this.scene.popMatrix();

    this.scene.pushMatrix();
    this.scene.translate(0.5,0,0);
    this.scene.rotate(Math.PI/2, 0, 1, 0);
    this.displayQuad();
    this.scene.popMatrix();

    this.scene.pushMatrix();
    this.scene.translate(0.0,0,-0.5);
    this.scene.rotate(Math.PI, 0, 1, 0);
    this.displayQuad();
    this.scene.popMatrix();

    this.scene.pushMatrix();
    this.scene.translate(-0.5,0,0.0);
    this.scene.rotate(-Math.PI/2, 0, 1, 0);
    this.displayQuad();
    this.scene.popMatrix();

    this.scene.pushMatrix();
    this.scene.translate(0.0,-0.5,0.0);
    this.scene.rotate(Math.PI/2, 1, 0, 0);
    this.displayQuad();
    this.scene.popMatrix();

    this.scene.pushMatrix();
    this.scene.translate(0.0,0.5,0.0);
    this.scene.rotate(-Math.PI/2, 1, 0, 0);
    this.displayQuad();
    this.scene.popMatrix();
};

/**
 * Auxiliar method used to draw a quad in the origin
 * @method displayQuad
 */
MyCube.prototype.displayQuad = function() {
    this.scene.pushMatrix();
    this.scene.translate(-0.5, -0.5, 0);
    this.quad.display();
    this.scene.popMatrix();
};

/**
 * Updates the texture coordinates of the primitive
 * @method updateTex
 * @param {Float} S
 * @param {Float} T
 */
MyCube.prototype.updateTex = function(S, T) {
    this.quad.updateTex(S, T);
};
