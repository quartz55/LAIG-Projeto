Function MyPatch(scene,order,partsU,partsV,knots,controlPoints){
    CGFobject.call(this,scene);

	  var nurbsSurface = new CGFnurbsSurface(order, order, knots, knots, controlPoints);
    getSurfacePoint = function(u,v){
		return nurbsSurface.getPoint(u,v);
	};
	
    CGFnurbsObject.call(this,scene,getSurfacePoint, partsU, partsV);
}

MyPatch.prototype = Object.create(CGFnurbsObject.prototype);
MyPatch.prototype.constructor = MyPatch;

MyPatch.prototype.scaleTexCoords = function(ampS, ampT){};
