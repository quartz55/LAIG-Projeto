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
        this.args[2], this.args[3], 0
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
        3, 2, 1
    ];

    this.normals = [
        0, 0, 1,
        0, 0, 1,
        0, 0, 1,
        0, 0, 1
    ];

    this.baseTexCoords = [
        0, 0,
        0, Math.abs(this.args[1]-this.args[3]),
        Math.abs(this.args[2]-this.args[0]), 0,
        Math.abs(this.args[2]-this.args[0]), Math.abs(this.args[1]-this.args[3])
    ];

    console.log(this.baseTexCoords);

    this.texCoords = this.baseTexCoords.slice();

    this.primitiveType=this.scene.gl.TRIANGLES;
    this.initGLBuffers();
};

MyQuad.prototype.updateTex = function(S, T) {
    for (var i = 0; i < this.texCoords.length; i+=2) {
        this.texCoords[i] = this.baseTexCoords[i]/S;
        this.texCoords[i+1] = this.baseTexCoords[i+1]/T;
    }

    this.updateTexCoordsGLBuffers();
};
