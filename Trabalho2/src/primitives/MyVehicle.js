function MyVehicle(scene){
    CGFobject.call(this, scene);

    this.plane = new MyPlane(scene, [50]);
}

MyVehicle.prototype = Object.create(CGFobject.prototype);
MyVehicle.prototype.constructor = MyVehicle;

MyVehicle.prototype.display = function() {};

MyVehicle.prototype.updateTex = function(ampS, ampT){};
