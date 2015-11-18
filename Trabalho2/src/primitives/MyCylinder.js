/**
 * Primitive that represents a cylinder
 * @constructor
 * @class MyCylinder
 * @extends CGFobject
 * @module Primitives
 * @param {CGFscene} scene
 * @param {Integer} slices
 * @param {Integer} stacks
 * @param {Float} topRad
 * @param {Float} botRad
 * @param {Float} height
 */
function MyCylinder(scene, slices, stacks, topRad, botRad, height) {
    CGFobject.call(this, scene);

    this.slices = slices || 8;
    this.stacks = stacks || 8;
    this.topRad = topRad || 1;
    this.botRad = botRad || 1;
    this.height = height || 1;

    this.initBuffers();
};

MyCylinder.prototype = Object.create(CGFobject.prototype);
MyCylinder.prototype.constructor = MyCylinder;

/**
 * Initializes WebGL buffers for object
 * @method initBuffers
 */
MyCylinder.prototype.initBuffers = function() {
    this.vertices = [];
    this.indices = [];
    this.normals = [];
    this.texCoords = [];

    const angle = (2 * Math.PI) / this.slices; /* 2*PI/nSlices */

    var numVertices = (this.slices + 1) * 2;
    var delta_rad = (this.botRad - this.topRad) / this.stacks;

    var Z = this.height / 2;

    var currentIndex = 0;

    var a = 0,
        b = 0;

    for (var s = 0; s < this.stacks; s++) {
        for (var i = 0; i <= this.slices; i++) {

            var currRad = (this.topRad + delta_rad * s);
            var nextRad = (this.topRad + delta_rad * (s + 1));

            var v1 = vec3.fromValues(currRad * Math.cos(i * angle),
                currRad * Math.sin(i * angle),
                Z);

            var v2 = vec3.fromValues(nextRad * Math.cos(i * angle),
                nextRad * Math.sin(i * angle),
                Z - this.height / this.stacks);

            var vnext = vec3.fromValues(currRad * Math.cos((i + 1) * angle),
                currRad * Math.sin((i + 1) * angle),
                Z);

            var vecNormal = vec3.create();

            var vec1 = vec3.create();
            var vec2 = vec3.create();
            vec3.sub(vec1, v2, v1);
            vec3.sub(vec2, vnext, v1);
            vec3.cross(vecNormal, vec1, vec2);
            vec3.normalize(vecNormal, vecNormal);

            // console.log(vecNormal[0], vecNormal[1], vecNormal[2]);
            // console.log(Math.cos(i*angle), Math.sin(i*angle), 0);

            this.vertices.push(v1[0], v1[1], v1[2]);
            this.normals.push(vecNormal[0], vecNormal[1], vecNormal[2]);
            this.texCoords.push(a, b);

            this.vertices.push(v2[0], v2[1], v2[2]);
            this.normals.push(vecNormal[0], vecNormal[1], vecNormal[2]);
            this.texCoords.push(a, b + 1.0 / this.stacks);

            a += 1 / this.slices;
        }

        Z -= this.height / this.stacks;
        a = 0;
        b += 1 / this.stacks;

        currentIndex = s * numVertices;
        for (i = 0; i < this.slices; i++, currentIndex += 2) {
            this.indices.push(currentIndex, currentIndex + 1, currentIndex + 2);
            this.indices.push(currentIndex + 2, currentIndex + 1, currentIndex + 3);
        }
    }

    this.baseTexCoords = this.texCoords.slice();

    this.primitiveType = this.scene.gl.TRIANGLES;
    this.initGLBuffers();
};

/**
 * Updates the texture coordinates of the primitive
 * @method updateTex
 * @param {Float} S
 * @param {Float} T
 */
MyCylinder.prototype.updateTex = function(S, T) {
    for (var i = 0; i < this.texCoords.length; i += 2) {
        this.texCoords[i] = this.baseTexCoords[i] / S;
        this.texCoords[i + 1] = this.baseTexCoords[i + 1] / T;
    }

    this.updateTexCoordsGLBuffers();
};
