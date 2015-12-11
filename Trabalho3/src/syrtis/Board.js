function Board(parser, board) {
    this.parser = parser;
    this.parser.board = this;

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

    // console.log(this.pieces.length + ": " + this.pieces);
    // console.log(this.towers.length + ": " + this.towers);
}

Board.prototype.display = function() {
    var board_node = this.parser.findNode("board");
    mat4.scale(board_node.matrix, board_node.matrix, [1.5, 1.5, 1.5]);
    mat4.translate(board_node.matrix, board_node.matrix, [-Math.floor(this.size/2), 0, -Math.floor(this.size/2)]);

    for (var i = 0; i < this.pieces.length; ++i) {
        var piece = this.pieces[i];
        var node = new LSXNode("Piece"+i);
        node.material = "null";
        node.texture = "null";
        mat4.translate(node.matrix, node.matrix, [piece.x, 0, piece.y]);
        node.descendants.push(piece.type);
        board_node.descendants.push("Piece"+i);
        this.parser.nodes.push(node);
    }
};
