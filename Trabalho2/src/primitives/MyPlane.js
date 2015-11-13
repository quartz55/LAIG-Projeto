function MyPlane(scene,nrDivs){
	var nurbsSurface = new CGFnurbsSurface(1, 1, [0,0,1,1], [0,0,1,1],[[[0,0,0],[1,0,0]],[[1,0,0],[1,0,1]]]);
	getSurfacePoint = function(u,v){
		return nurbsSurface.getPoint(u,v);
	};
	
	CGFnurbsObject.cal(this,scene,getSurfacePoint, nrDivs, nrDivs);
}

Myplane.prototype = Object.creat(CGFnurbsObject.prototype);
MyPlane.prototype.constructor = Myplane;

MyPlane.prototype.scaleTexCoords = function(ampS, ampT){}