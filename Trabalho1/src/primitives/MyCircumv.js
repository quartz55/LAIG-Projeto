/**
 * MyCircumv
 * @param gl {WebGLRenderingContext}
 * @constructor
 */
function MyCircumv(scene, args) {
    CGFobject.call(this, scene);

	this.args=args;
	
    this.height=1/8;
	
	this.slices=this.args[0];
	
	this.radius=[];
	
	for(var i=0; i<8;i++){
		this.radius.push(this.args[i+1]);
	}

    this.initBuffers();
};

MyCircumv.prototype = Object.create(CGFobject.prototype);
MyCircumv.prototype.constructor = MyCircumv;

MyCircumv.prototype.initBuffers = function() {

    this.vertices = [];

    this.indices = [];
	
	this.normals=[];
	var ang=Math.PI*2/this.slices;
	
	//for para as as stack, 8 radius => 7 stacks
	for(var j=0; j<7;j++){
		var correntRadius = this.radius[j];
		var nextRadius=this.radius[j+1];
		//for para o numero total de vertices, ou seja, cada slice tem 4 vertices
		for(var i=0; i<this.slices;i++){
			var V1= vec3.fromValues(correntRadius*Math.cos(ang*i), correntRadius*Math.sin(ang*i),this.height*j);
			var V2= vec3.fromValues(correntRadius*Math.cos(ang*(i+1)), correntRadius*Math.sin(ang*(i+1)),this.height*j);
			var V3= vec3.fromValues(nextRadius*Math.cos(ang*i), nextRadius*Math.sin(ang*i),this.height*(j+1));
			var V4 = vec3.fromValues(nextRadius*Math.cos(ang*(i+1)), nextRadius*Math.sin(ang*(i+1)),this.height*(j+1));
			
			this.vertices.push(V1[0],V1[1],V1[2]);
			this.vertices.push(V2[0],V2[1],V2[2]);
			this.vertices.push(V3[0],V3[1],V3[2]);
			this.vertices.push(V4[0],V4[1],V4[2]);
			
			var primeiroVertice = i*4+this.slices*4*j;
			var indiceV1=primeiroVertice;
			var indiceV2=primeiroVertice+1;
			var indiceV3=primeiroVertice+2;
			var indiceV4=primeiroVertice+3;
			
			this.indices.push(indiceV1, indiceV2, indiceV3);
			this.indices.push(indiceV2, indiceV4, indiceV3);
			
			var A=vec3.create();
			var B=vec3.create();
			var N=vec3.create();
			
			vec3.sub(A,V2,V1);
			vec3.sub(B,V3,V1);
			vec3.cross(N,A,B);
			vec3.normalize(N,N);
			
			for(var k=0; k<4 ; k++)
				this.normals.push(N[0],N[1],N[2]);
		}
	}

    this.primitiveType = this.scene.gl.TRIANGLES;
    this.initGLBuffers();
};

MyCircumv.prototype.updateTex = function(S, T) {
};
