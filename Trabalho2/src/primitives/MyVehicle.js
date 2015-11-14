function MyVehicle(scene, args){
    CGFobject.call(this, scene);
    this.args = args || ["null", "null"];

    this.plane = new MyPlane(scene, [50]);
}

MyVehicle.prototype = Object.create(CGFobject.prototype);
MyVehicle.prototype.constructor = MyVehicle;

MyVehicle.prototype.display = function() {

    this.mat.apply();
    this.scene.setActiveShader(this.terrainShader);

    this.scene.pushMatrix();

    this.heightmap.bind(1);
    this.plane.display();

    this.scene.setActiveShader(this.scene.defaultShader);

    this.scene.popMatrix();

};

MyVehicle.prototype.updateTex = function(ampS, ampT){};
