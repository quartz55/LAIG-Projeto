/**
 * MyDiamond
 * @constructor
 */
function MyDiamond(scene, args){
	  CGFobject.call(this,scene);
    this.args = args || [6];
	
    this.slices = this.args[0];

    this.cone = new MyFullCylinder(scene, [1,0.5,0.01,8,this.slices]);
    this.cone.initBuffers();
};

MyDiamond.prototype = Object.create(CGFobject.prototype);
MyDiamond.prototype.constructor = MyDiamond;

MyDiamond.prototype.display = function()
{
    this.scene.pushMatrix();
	
	this.scene.pushMatrix();
	this.scene.rotate(-Math.PI/2,1,0,0);
	this.scene.rotate(Math.PI,1,0,0);
    this.cone.display();
	this.scene.popMatrix();
	
	this.scene.pushMatrix();
	this.scene.rotate(-Math.PI/2,1,0,0);
	this.cone.display();
	this.scene.popMatrix();
	
	this.scene.popMatrix();
	
};

MyDiamond.prototype.updateTex = function(S, T) {
    this.cone.updateTex(S, T);
};
