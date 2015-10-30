function LSXLeaf(id) {
    this.id = id;
    this.type = "";
    this.args = [];

    this.print = function() {
        console.log("Leaf " + this.id);
        console.log("Type: " + this.type);
        console.log("Args: " + this.args);
    };
}
