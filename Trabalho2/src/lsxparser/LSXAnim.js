function LSXAnim(id, span, type, args) {
    this.id = id;
    this.span = span;
    this.type = type;
    this.args = args;

    this.print = function() {
        console.log("Anim " + this.id);
        console.log("Span " + this.span);
        console.log("Type " + this.type);
        if (this.type == "linear") {
            for (var i = 0; i < this.args.length; ++i)
                console.log("CP: " + this.args[i]);
        }
        else if (this.type == "circular") {
            console.log("Center " + this.args["center"]);
            console.log("Radius " + this.args["radisu"]);
            console.log("Start Angle " + this.args["startang"]);
            console.log("Rotation Angle " + this.args["rotang"]);
        }
    };
}
LSXAnim.prototype.constructor = LSXAnim;
