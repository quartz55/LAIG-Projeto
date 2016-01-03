function Board(board) {
    this.towers = [];
    this.pieces = [];

    this.board = board;
    this.size = board.length;

    for (var i = 0; i < board.length; ++i) {
        for (var j = 0; j < board[i].length; ++j) {
            var tower = board[i][j][0];
            var piece = board[i][j][1];
            if (tower !== 0) this.towers.push(new Tower([j,i], tower));
            if (piece !== 0) this.pieces.push(new Piece([j,i], piece));
        }
    }
}

Board.prototype.display = function(graph) {
    var board_node = graph.findNode("board");
    mat4.scale(board_node.matrix, board_node.matrix, [1.5, 1.5, 1.5]);
    mat4.translate(board_node.matrix, board_node.matrix, [-Math.floor(this.size/2), 0, -Math.floor(this.size/2)]);

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

Board.prototype.getPieceID = function(position) {
    for (var i = 0; i < this.pieces.length; ++i)
        if (position[0] == this.pieces[i].x &&
            position[1] == this.pieces[i].y)
            return i;

    return null;
};

Board.prototype.getTowerID = function(position) {
    for (var i = 0; i < this.towers.length; ++i)
        if (position[0] == this.towers[i].x &&
            position[1] == this.towers[i].y)
            return i + 100;

    return null;
};

Board.prototype.getPiece = function(id) {
    if (id.constructor === Array) {
        return this.pieces[this.getPieceID(id)];
    }

    if (this.pieces[id])
        return this.pieces[id];
    return null;
};

Board.prototype.getTower = function(id) {
    if (id.constructor === Array) {
        return this.towers[this.getTowerID(id) - 100];
    }

    var towerID = id - 100;
    if (this.towers[towerID])
        return this.towers[towerID];
    return null;
};

Board.prototype.stringify = function() {
    return JSON.stringify(this.board);
};
