/**
 * Primitive that represents a flying vehicle (helicopter)
 * @class MyVehicle
 * @extends CGFobject
 * @constructor
 * @module Primitives
 * @param {CGFscene} scene
 */
function MyVehicle(scene){
    CGFobject.call(this, scene);

    this.cube = new MyCube(scene);
    this.front = new MyPatch(scene, [2, 20, 20, [
        [-0.5, -0.5, 0, 1],
        [-0.5, 0, 1, 1],
        [-0.5, 0.5, 0, 1],

        [0, -0.5, 0, 1],
        [0, 0, 1, 1],
        [0, 0.5, 0, 1],

        [0.5, -0.5, 0, 1],
        [0.5, 0, 1, 1],
        [0.5, 0.5, 0, 1]
    ]]);

    this.frontcover = new MyPatch(scene, [2, 20, 20, [
        [0, -0.5, 0, 1],
        [0, -0.5, 0, 1],
        [0, -0.5, 0, 1],

        [0, 0, 0, 1],
        [0, 0, 0.5, 1],
        [0, 0, 1, 1],

        [0, 0.5, 0, 1],
        [0, 0.5, 0, 1],
        [0, 0.5, 0, 1]
    ]]);
}

MyVehicle.prototype = Object.create(CGFobject.prototype);
MyVehicle.prototype.constructor = MyVehicle;

/**
 * Method that renders the primitive to the WebGL context
 * @method display
 */
MyVehicle.prototype.display = function() {

    // Supports
    ///// Right
    this.scene.pushMatrix();
    this.scene.translate(-0.5, 0 ,0);
    this.scene.scale(0.2, 0.2, 3);
    this.cube.display();
    this.scene.popMatrix();

    this.scene.pushMatrix();
    this.scene.translate(-0.5, 0.2 , 0.7 - 0.4);
    this.scene.scale(0.2, 0.5, 0.2);
    this.cube.display();
    this.scene.popMatrix();

    this.scene.pushMatrix();
    this.scene.translate(-0.5, 0.2 , -0.7 - 0.4);
    this.scene.scale(0.2, 0.5, 0.2);
    this.cube.display();
    this.scene.popMatrix();

    ///// Left
    this.scene.pushMatrix();
    this.scene.translate(0.5, 0 ,0);
    this.scene.scale(0.2, 0.2, 3);
    this.cube.display();
    this.scene.popMatrix();

    this.scene.pushMatrix();
    this.scene.translate(0.5, 0.2 , 0.7 - 0.4);
    this.scene.scale(0.2, 0.5, 0.2);
    this.cube.display();
    this.scene.popMatrix();

    this.scene.pushMatrix();
    this.scene.translate(0.5, 0.2 , -0.7 - 0.4);
    this.scene.scale(0.2, 0.5, 0.2);
    this.cube.display();
    this.scene.popMatrix();

    // Body
    this.scene.pushMatrix();
    this.scene.translate(0, 0.95, -0.4);
    this.scene.scale(1.25, 1, 2.5);
    this.cube.display();
    this.scene.popMatrix();

    ///// Patch surface
    this.scene.pushMatrix();
    this.scene.translate(0, 0.95, 0.85);

    this.scene.pushMatrix();
    this.scene.translate(0.625, 0, 0);
    this.frontcover.display();
    this.scene.popMatrix();

    this.scene.pushMatrix();
    this.scene.translate(-0.625, 0, 0);
    this.scene.rotate(Math.PI, 0, 0, 1);
    this.frontcover.display();
    this.scene.popMatrix();

    this.scene.scale(1.25,1, 1);
    this.front.display();
    this.scene.popMatrix();

    // Tail
    this.scene.pushMatrix();
    this.scene.translate(0, 0.95, -2.5);
    this.scene.scale(0.3, 0.6, 2);
    this.cube.display();
    this.scene.popMatrix();

    this.scene.pushMatrix();
    this.scene.translate(0, 0.95, -3.5);
    this.scene.scale(0.3, 1.2, 0.5);
    this.cube.display();
    this.scene.popMatrix();

    // Helices
    this.scene.pushMatrix();
    this.scene.translate(0, 2.0, -0.5);
    this.drawHelices(5);
    this.scene.popMatrix();

    this.scene.pushMatrix();
    this.scene.translate(0.5, 1.0, -3.5);
    this.scene.rotate(-Math.PI/2, 0, 0, 1);
    this.drawHelices(1);
    this.scene.popMatrix();
};

/**
 * Auxiliar method used to draw helices with the length provided
 * @method drawHelices
 * @param {Float} length
 */
MyVehicle.prototype.drawHelices = function(length) {
    this.scene.pushMatrix();
    this.scene.translate(0, -0.3, 0);
    this.scene.scale(length*0.6/6, 0.5, length*0.6/6);
    this.cube.display();
    this.scene.popMatrix();

    this.scene.pushMatrix();
    this.scene.scale(length, 0.1, length/6);
    this.cube.display();
    this.scene.popMatrix();

    this.scene.pushMatrix();
    this.scene.scale(length/6, 0.1, length);
    this.cube.display();
    this.scene.popMatrix();
};

/**
 * Updates the texture coordinates of the primitive
 * @method updateTex
 * @param {Float} S
 * @param {Float} T
 */
MyVehicle.prototype.updateTex = function(ampS, ampT){};
