/**
 * MyQuad
 * @param gl {WebGLRenderingContext}
 * @constructor
 */
function MyQuad(scene, args) {
    CGFobject.call(this,scene);

    this.args = args;

    this.initBuffers();
};

MyQuad.prototype = Object.create(CGFobject.prototype);
MyQuad.prototype.constructor=MyQuad;

MyQuad.prototype.initBuffers = function () {

    this.vertices = [
        this.args[0], this.args[1], 0,
        this.args[0], this.args[3], 0,
        this.args[2], this.args[1], 0,
        this.args[2], this.args[3], 0,
    ];

    /*

     0          2
     +---------+
     |
     |
     |
     |
     +---------+ 3
     1

     */

    this.indices = [
        0, 1, 2,
        3, 2, 1,
    ];

    this.normals = [
        0, 0, -1,
        0, 0, -1,
        0, 0, -1,
        0, 0, -1
    ];

    this.primitiveType=this.scene.gl.TRIANGLES;
    this.initGLBuffers();
};

MyQuad.prototype.updateTex = function(S, T) {
    this.texCoords = [
        0, 0,
        0, T,
        S, 0,
        S, T
    ];

    this.updateTexCoordsGLBuffers();
};
