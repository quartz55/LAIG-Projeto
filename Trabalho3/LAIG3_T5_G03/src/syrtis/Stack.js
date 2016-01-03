function Stack() {
    this.lightTowers = [];
    this.darkTowers = [];
    this.pieces = [];
}

Stack.prototype.constructor = Stack;

Stack.prototype.init = function () {
    this.lightTowers.push(new Tower([0,0], 2), new Tower([0,0], 2));
    this.darkTowers.push(new Tower([0,0], 1), new Tower([0,0], 1));
};

Stack.prototype.pushPiece = function(type) {
    this.pieces.push(new Piece([j,i], type));
};

Stack.prototype.display = function(graph) {
    var stack = graph.findNode("stack");

    var node;
    for (var i = 0; i < this.pieces.length; ++i) {
        var piece = this.pieces[i];
        node = new LSXNode("Piece"+i);
        node.material = "null";
        node.texture = "null";
        node.anims = piece.animations;
        mat4.translate(node.matrix, node.matrix, [piece.x, 0, piece.y]);
        node.descendants.push(piece.type);
        board_node.descendants.push("Piece"+i);
        graph.nodes.push(node);
    }

    for (i = 0; i < this.towers.length; ++i) {
        var tower = this.towers[i];
        node = new LSXNode("Tower"+i);
        node.material = "null";
        node.texture = "null";
        node.anims = tower.animations;
        mat4.translate(node.matrix, node.matrix, [tower.x, 0, tower.y]);
        node.descendants.push(tower.type);
        board_node.descendants.push("Tower"+i);
        graph.nodes.push(node);
    }
};
