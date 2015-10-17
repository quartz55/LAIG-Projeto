/**
 * MyCylinder
 * @constructor
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

MyCylinder.prototype.initBuffers = function() {
    this.vertices = [];
    this.indices = [];
    this.normals = [];
    this.texCoords = [];

    const angle = (2 * Math.PI) / this.slices; /* 2*PI/nSlices */

    var numVertices = (this.slices+1) * 2;
    var delta_rad = (this.botRad - this.topRad) / this.stacks;

    var Z = this.height/2;

    var currentIndex = 0;

    var a = 0,
        b = 0;

    for (var s = 0; s < this.stacks; s++) {
        for (var i = 0; i <= this.slices; i++) {

            var currRad = (this.topRad + delta_rad*s);
            var nextRad = (this.topRad + delta_rad*(s+1));

            var v1 = {x: currRad*Math.cos(i*angle),
                      y: currRad*Math.sin(i*angle),
                      z: Z};

            this.vertices.push(v1.x, v1.y, v1.z);
            this.normals.push(Math.cos(i * angle), Math.sin(i * angle), 0);
            this.texCoords.push(a, b);


            var v2 = {x: nextRad*Math.cos(i*angle),
                      y: nextRad*Math.sin(i*angle),
                      z: Z-this.height/this.stacks};

            this.vertices.push(v2.x, v2.y, v2.z);
            this.normals.push(Math.cos(i * angle), Math.sin(i * angle), 0);
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

MyCylinder.prototype.updateTex = function(S, T) {
    for (var i = 0; i < this.texCoords.length; i+=2) {
        this.texCoords[i] = this.baseTexCoords[i]/S;
        this.texCoords[i+1] = this.baseTexCoords[i+1]/T;
    }

    this.updateTexCoordsGLBuffers();
};
