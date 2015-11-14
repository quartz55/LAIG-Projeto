function MyPatch(scene, args) {
    this.args = args || [
        1, 1, 1, [
            [1, 1, 1],
            [1, -1, 1],
            [-1, 1, 1],
            [1, 1, -1]
        ]
    ];

    this.order = this.args[0];
    this.partsU = this.args[1];
    this.partsV = this.args[2];
    this.cps = this.getControlPoints(this.args[3]);
    var knot = this.getKnots();

    var nurbsSurface = new CGFnurbsSurface(this.order, this.order, knot, knot, this.cps);
    getSurfacePoint = function(u, v) {
        return nurbsSurface.getPoint(u, v);
    };

    CGFnurbsObject.call(this, scene, getSurfacePoint, this.partsU, this.partsV);
}

MyPatch.prototype = Object.create(CGFnurbsObject.prototype);
MyPatch.prototype.constructor = MyPatch;

MyPatch.prototype.getControlPoints = function(CPList) {
    var finalList = [];
    for (var Uorder = 0; Uorder <= this.order; ++Uorder) {
        var vList = [];
        for (var Vorder = 0; Vorder <= this.order; ++Vorder) {
            var index = Uorder * (this.order+1) + Vorder;
            console.log(index);
            vList.push(CPList[index]);
        }
        finalList.push(vList);
    }

    console.log(finalList);

    return finalList;
};

MyPatch.prototype.getKnots = function() {
    var knot = [];
    for (var i = 0; i < this.order+1; ++i)
        knot.push(0);
    for (var i = 0; i < this.order+1; ++i)
        knot.push(1);

    console.log(knot);
    return knot;
};

MyPatch.prototype.updateTex = function(ampS, ampT) {};
