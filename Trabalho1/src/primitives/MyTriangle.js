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

    var vA = vec3.fromValues(this.args[0], this.args[1], this.args[2]);
    var vB = vec3.fromValues(this.args[3], this.args[4], this.args[5]);
    var vC = vec3.fromValues(this.args[6], this.args[7], this.args[8]);

    // Get normals
    var AB = vec3.create();
    vec3.sub(AB, vB, vA);
    var AC = vec3.create();
    vec3.sub(AC, vC, vA);

	  var N = vec3.create();
	  vec3.cross(N, AB, AC);
	  vec3.normalize(N, N);

	  this.normals = [
		    N[0], N[1], N[2],
		    N[0], N[1], N[2],
		    N[0], N[1], N[2],
    ];

    var ang = Math.acos(vec3.dot(AB,AC)/(vec3.len(AB)*vec3.len(AC)));
    var C = [Math.cos(ang) * vec3.len(AC), Math.sin(ang) * vec3.len(AC)];

    this.baseTexCoords = [
        0, 0,
        vec3.length(AB), 0,
        C[0], C[1]
    ];

    this.texCoords = this.baseTexCoords.slice();

    this.primitiveType = this.scene.gl.TRIANGLES;
    this.initGLBuffers();
};

MyTriangle.prototype.updateTex = function(S, T) {
    for (var i = 0; i < this.texCoords.length; i+=2) {
        this.texCoords[i] = this.baseTexCoords[i]/S;
        this.texCoords[i+1] = this.baseTexCoords[i+1]/T;
    }

    this.updateTexCoordsGLBuffers();
};
