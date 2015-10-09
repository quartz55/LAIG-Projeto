/**
 * MyCylinder
 * @constructor
 */
function MyCylinder(scene, slices, stacks, topRad, botRad) {
    CGFobject.call(this, scene);

    this.slices = slices || 8;
    this.stacks = stacks || 8;
    this.topRad = topRad || 1;
    this.botRad = botRad || 1;

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
    var numVertices = this.slices * 2;

    var Z = 0.5;
    var currentIndex = 0;
    var maxIndex = 0;

    var a = 0,
        b = 0;

    for (s = 0; s < this.stacks; s++, currentIndex = s * numVertices) {
        for (i = 0; i < this.slices; i++, maxIndex += 2) {
            this.vertices.push(Math.cos(i * angle), Math.sin(i * angle), Z);
            this.normals.push(Math.cos(i * angle), Math.sin(i * angle), 0);
            this.texCoords.push(a, b);


            this.vertices.push(Math.cos(i * angle), Math.sin(i * angle), Z - 1.0 / this.stacks);
            this.normals.push(Math.cos(i * angle), Math.sin(i * angle), 0);
            this.texCoords.push(a, b + 1.0 / this.stacks);

            a += 1 / this.slices;
        }
        a = 0;
        b += 1 / this.stacks;

        for (i = 0; i < this.slices - 1; i++, currentIndex += 2) {
            this.indices.push(currentIndex, currentIndex + 1, currentIndex + 2);
            this.indices.push(currentIndex + 2, currentIndex + 1, currentIndex + 3);
        }

        /*
         Last slice (with vertices from the first)
         */
        this.indices.push(currentIndex, currentIndex + 1, s * numVertices);
        this.indices.push(s * numVertices, currentIndex + 1, s * numVertices + 1);

        Z -= 1.0 / this.stacks;
    }

    this.primitiveType = this.scene.gl.TRIANGLES;
    this.initGLBuffers();
};
