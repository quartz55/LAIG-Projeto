/**
 * Primitive that represents a circle
 * @constructor
 * @class MyCircle
 * @extends CGFobject
 * @module Primitives
 * @param {CGFscene} scene
 * @param {Float} rad Circle radius
 * @param {Integer} slices
 */
function MyCircle(scene, rad, slices) {
    CGFobject.call(this, scene);

    this.rad = rad || 1;
    this.slices = slices || 8;

    this.initBuffers();
};

MyCircle.prototype = Object.create(CGFobject.prototype);
MyCircle.prototype.constructor = MyCircle;

/**
 * Initializes WebGL buffers for object
 * @method initBuffers
 */
MyCircle.prototype.initBuffers = function() {
    this.vertices = [];
    this.indices = [];
    this.normals = [];
    this.texCoords = [];

    const angle = (2 * Math.PI) / this.slices; /* 2*PI/nSlices */

    for (i = 0; i < this.slices; i++) {
        this.vertices.push(this.rad*Math.cos(i * angle), this.rad*Math.sin(i * angle), 0);
        this.normals.push(0, 0, 1);
        this.texCoords.push(0.5 + 0.5 * Math.cos(i * angle), 0.5 - 0.5 * Math.sin(i * angle));
    }

    this.vertices.push(0, 0, 0); /* Center Vertice */
    this.normals.push(0, 0, 1);
    this.texCoords.push(0.5, 0.5);

    for (i = 0, index = 0; i < this.slices; i++, index++) {
        if (index == this.slices - 1) {
            this.indices.push(index, 0, this.slices);
            break;
        } else this.indices.push(index, index + 1, this.slices);
    }

    this.primitiveType = this.scene.gl.TRIANGLES;
    this.initGLBuffers();
};
