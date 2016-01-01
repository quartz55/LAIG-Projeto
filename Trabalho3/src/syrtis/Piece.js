function Piece(position, type) {
    this.x = position[0];
    this.y = position[1];

    this.type = null;

    switch (type) {
        case 1:
            this.type = "round-light-piece";
            break;
        case 2:
            this.type = "square-light-piece";
            break;
        case 3:
            this.type = "round-dark-piece";
            break;
        case 4:
            this.type = "square-dark-piece";
            break;
    }
}

Piece.prototype.getShape = function() {
    if (this.type == "round-light-piece" || this.type == "round-dark-piece") {
        return "round";
    }
    else return "square";

    return "invalid";
};

Piece.prototype.getColor = function() {
    if (this.type == "round-light-piece" || this.type == "square-light-piece") {
        return "light";
    }
    else return "dark";

    return "invalid";
};
