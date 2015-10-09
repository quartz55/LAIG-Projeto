/**
 * MyUnitCubeQuad
 * @param gl {WebGLRenderingContext}
 * @constructor
 */
function MyUnitCubeQuad(scene) {
	  CGFobject.call(this,scene);
    this.quad = new MyQuad(scene);
    this.quad.initBuffers();
};

MyUnitCubeQuad.prototype = Object.create(CGFobject.prototype);
MyUnitCubeQuad.prototype.constructor=MyUnitCubeQuad;

MyUnitCubeQuad.prototype.display = function (){

    /* Front face */
    this.scene.pushMatrix();
    this.scene.translate(0,0,0.5);
    this.quad.display();

    /* Top face */
    this.scene.popMatrix();
    this.scene.pushMatrix();
    this.scene.translate(0,0.5,0);
    this.scene.rotate(-3.14/2,1,0,0);
    this.quad.display();

    /* Back face */
    this.scene.popMatrix();
    this.scene.pushMatrix();
    this.scene.translate(0,0,-0.5);
    this.scene.rotate(3.14,1,0,0);
    this.quad.display();

    /* Bottom face */
    this.scene.popMatrix();
    this.scene.pushMatrix();
    this.scene.translate(0,-0.5,0);
    this.scene.rotate(3.14/2,1,0,0);
    this.quad.display();

    /* Right face */
    this.scene.popMatrix();
    this.scene.pushMatrix();
    this.scene.translate(0.5,0,0);
    this.scene.rotate(3.14/2,0,1,0);
    this.quad.display();

    /* Left face */
    this.scene.popMatrix();
    this.scene.pushMatrix();
    this.scene.translate(-0.5,0,0);
    this.scene.rotate(-3.14/2,0,1,0);
    this.quad.display();

    this.scene.popMatrix();
};
