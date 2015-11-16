function MyCube(scene) {
    CGFobject.call(this,scene);

    this.quad = new MyQuad(scene, null);
};

MyCube.prototype = Object.create(CGFobject.prototype);
MyCube.prototype.constructor=MyCube;

MyCube.prototype.display = function() {
    this.scene.pushMatrix();
    this.scene.translate(0,0,0.5);
    this.displayQuad();
    this.scene.popMatrix();

    this.scene.pushMatrix();
    this.scene.translate(0.5,0,0);
    this.scene.rotate(Math.PI/2, 0, 1, 0);
    this.displayQuad();
    this.scene.popMatrix();

    this.scene.pushMatrix();
    this.scene.translate(0.0,0,-0.5);
    this.scene.rotate(Math.PI, 0, 1, 0);
    this.displayQuad();
    this.scene.popMatrix();

    this.scene.pushMatrix();
    this.scene.translate(-0.5,0,0.0);
    this.scene.rotate(-Math.PI/2, 0, 1, 0);
    this.displayQuad();
    this.scene.popMatrix();

    this.scene.pushMatrix();
    this.scene.translate(0.0,-0.5,0.0);
    this.scene.rotate(Math.PI/2, 1, 0, 0);
    this.displayQuad();
    this.scene.popMatrix();

    this.scene.pushMatrix();
    this.scene.translate(0.0,0.5,0.0);
    this.scene.rotate(-Math.PI/2, 1, 0, 0);
    this.displayQuad();
    this.scene.popMatrix();
};

MyCube.prototype.displayQuad = function() {
    this.scene.pushMatrix();
    this.scene.translate(-0.5, -0.5, 0);
    this.quad.display();
    this.scene.popMatrix();
};
