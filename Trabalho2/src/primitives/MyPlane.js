function MyPlane(scene,nrDivs){
    CGFobject.call(this,scene);

    var nurbsSurface = new CGFnurbsSurface(1, 1, [0,0,1,1], [0,0,1,1],
                                           [
                                               [
                                                   [-2,-2,0,1],
                                                   [-2,2,0,1]
                                               ],
                                               [
                                                   [2,-2,0,1],
                                                   [2,2,1,1]
                                               ]
                                           ]);
    var getSurfacePoint = function(u,v){
		return nurbsSurface.getPoint(u,v);
  };

    CGFnurbsObject.call(this, scene, getSurfacePoint, nrDivs, nrDivs);
}

MyPlane.prototype = Object.create(CGFnurbsObject.prototype);
MyPlane.prototype.constructor = MyPlane;

MyPlane.prototype.scaleTexCoords = function(ampS, ampT){};
