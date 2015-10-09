/**
 * MyTriangle
 * @param gl {WebGLRenderingContext}
 * @constructor
 */
function MyTriangle(scene, minS, maxS, minT, maxT) {
	  CGFobject.call(this,scene);

    this.minS = minS || 0.0;
    this.maxS = maxS || 1.0;
    this.minT = minT || 0.0;
    this.maxT = maxT || 1.0;

	  this.initBuffers();
};

MyTriangle.prototype = Object.create(CGFobject.prototype);
MyTriangle.prototype.constructor=MyTriangle;

MyTriangle.prototype.initBuffers = function () {

	  this.vertices = [
        0.5, 0.3, 0,
        -0.5, 0.3, 0,
        0.0, 0.3, 2
		];

	  this.indices = [
        2, 0, 1,
    ];

    this.normals = [
        0, 1, 0,
        0, 1, 0,
        0, 1, 0,
    ];

    this.texCoords = [
        this.minS, this.maxT,
        this.maxS, this.maxT,
        (this.minS+this.maxS)/2, this.minT,
    ];

	  this.primitiveType=this.scene.gl.TRIANGLES;
	  this.initGLBuffers();
};
