function MyPatch(scene,order,partsU,partsV,controlPoints){
	var nurbsSurface = new CGFnurbsSurface(1, 1, [0,0,1,1], [0,0,1,1],[[[0,0,0],[1,0,0]],[[1,0,0],[1,0,1]]]);
	getSurfacePoint = function(u,v){
		return nurbsSurface.getPoint(u,v);
	};
	
	CGFnurbsObject.cal(this,scene,getSurfacePoint, partsU, partsV);
}

MyPatch.prototype = Object.creat(CGFnurbsObject.prototype);
MyPatch.prototype.constructor = MyPatch;

MyPatch.prototype.scaleTexCoords = function(ampS, ampT){}