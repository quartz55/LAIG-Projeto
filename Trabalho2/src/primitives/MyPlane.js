function MyPlane(scene,nrDivs){
    var nurbsSurface = new CGFnurbsSurface(1, 1, [0,0,1,1], [0,0,1,1],
                                           [
                                               [
                                                   [0.5,0,-0.5,1],
                                                   [0.5,0, 0.5,1]
                                               ],
                                               [
                                                   [-0.5,0,-0.5,1],
                                                   [-0.5,0,0.5,1,1]
                                               ]
                                           ]);
  var getSurfacePoint = function(u,v){
		return nurbsSurface.getPoint(u,v);
  };

    CGFnurbsObject.call(this, scene, getSurfacePoint, nrDivs, nrDivs);
}

MyPlane.prototype = Object.create(CGFnurbsObject.prototype);
MyPlane.prototype.constructor = MyPlane;

MyPlane.prototype.updateTex = function(ampS, ampT){};
