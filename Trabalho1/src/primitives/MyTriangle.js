/**
 * MyTriangle
 * @param gl {WebGLRenderingContext}
 * @constructor
 */
function MyTriangle(scene, args) {
    CGFobject.call(this, scene);

    this.args = args;

    this.initBuffers();
};

MyTriangle.prototype = Object.create(CGFobject.prototype);
MyTriangle.prototype.constructor = MyTriangle;

MyTriangle.prototype.initBuffers = function() {

    this.vertices = this.args;

    this.indices = [
        0, 1, 2,
    ];

    // Get normals
    var A = vec3.fromValues(this.x1-this.x2, this.y1-this.y2, this.z1-this.z2);
	  var B = vec3.fromValues(this.x1-this.x3, this.y1-this.y3, this.z1-this.z3);
	  var N = vec3.create();
	  vec3.cross(N, A, B);
	  vec3.normalize(N, N);

	  this.normals = [
		    N[0], N[1], N[2],
		    N[0], N[1], N[2],
		    N[0], N[1], N[2],
    ];

	  this.texCoords = [
		    0, 0,
		    1, 0,
		    1, 1
	  ];

    this.primitiveType = this.scene.gl.TRIANGLES;
    this.initGLBuffers();
};

MyTriangle.prototype.updateTex = function(S, T) {};
