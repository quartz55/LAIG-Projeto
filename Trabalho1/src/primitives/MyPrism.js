/**
 * MyPrism
 * @constructor
 */
function MyPrism(scene, slices, stacks) {
	  CGFobject.call(this,scene);

	  this.slices=slices;
	  this.stacks=stacks;

 	  this.initBuffers();
};

MyPrism.prototype = Object.create(CGFobject.prototype);
MyPrism.prototype.constructor = MyPrism;

MyPrism.prototype.initBuffers = function() {

    this.vertices = [];
    this.indices = [];
    this.normals = [];

    const angle = (2*Math.PI)/this.slices; /* 2*PI/nSlices */
    const numVertices = this.stacks*4;

    Z = 0.5;
    indice = 0;

    for(s = 0; s < this.stacks; s++){

        for(i = 0; i < this.slices; i++){
            this.vertices.push(Math.cos(i*angle));
            this.vertices.push(Math.sin(i*angle));
            this.vertices.push(Z);

            this.vertices.push(Math.cos((i+1)*angle));
            this.vertices.push(Math.sin((i+1)*angle));
            this.vertices.push(Z);

            this.vertices.push(Math.cos(i*angle));
            this.vertices.push(Math.sin(i*angle));
            this.vertices.push(Z-1.0/this.stacks);

            this.vertices.push(Math.cos((i+1)*angle));
            this.vertices.push(Math.sin((i+1)*angle));
            this.vertices.push(Z-1.0/this.stacks);

            normAngle = i*angle+angle/2;
            for(j = 0; j < 4; j++){
                this.normals.push(Math.cos(normAngle));
                this.normals.push(Math.sin(normAngle));
                this.normals.push(0);
            }

            this.indices.push(indice+1);
            this.indices.push(indice);
            this.indices.push(indice+2);

            this.indices.push(indice+1);
            this.indices.push(indice+2);
            this.indices.push(indice+3);
            indice+=4;
        }
        Z-=1.0/this.stacks;
    }

 	  this.primitiveType = this.scene.gl.TRIANGLES;
 	  this.initGLBuffers();
};
