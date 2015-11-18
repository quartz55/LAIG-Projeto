function MyPatch(scene, args) {
    this.args = args || [
        1, 20, 20, [
            [1, 1, 1],
            [1, -1, 1],
            [-1, 1, 1],
            [1, 1, -1]
        ]
    ];

    this.orderU = this.args[0][0];
	this.orderV = this.args[0][1];
    this.partsU = this.args[1];
    this.partsV = this.args[2];
    this.cps = this.getControlPoints(this.args[3]);
    var knot = this.getKnots();

	console.log(this.orderU);
	console.log(this.orderV);
	console.log(this.cps);
    var nurbsSurface = new CGFnurbsSurface(this.orderU, this.orderV, knot[0], knot[1], this.cps);
    getSurfacePoint = function(u, v) {
        return nurbsSurface.getPoint(u, v);
    };

    CGFnurbsObject.call(this, scene, getSurfacePoint, this.partsU, this.partsV);
}

MyPatch.prototype = Object.create(CGFnurbsObject.prototype);
MyPatch.prototype.constructor = MyPatch;

MyPatch.prototype.getControlPoints = function(CPList) {
    var finalList = [];
    for (var Uorder = 0; Uorder <= this.orderU; ++Uorder) {
        var vList = [];
        for (var Vorder = 0; Vorder <= this.orderV; ++Vorder) {
            var index = Uorder * (this.orderV+1) + Vorder;
            vList.push(CPList[index]);
        }
        finalList.push(vList);
    }

    return finalList;
};

MyPatch.prototype.getKnots = function() {
    var knotU = [];
    for (var i = 0; i < this.orderU+1; ++i)
        knotU.push(0);
    for (var i = 0; i < this.orderU+1; ++i)
        knotU.push(1);
	
	var knotV = [];
	   for (var i = 0; i < this.orderV+1; ++i)
        knotV.push(0);
    for (var i = 0; i < this.orderV+1; ++i)
        knotV.push(1);

    return [knotU,knotV];
};

MyPatch.prototype.updateTex = function(ampS, ampT) {};
