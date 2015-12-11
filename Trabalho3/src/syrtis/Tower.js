function Tower(position, type) {
    this.x = position[0];
    this.y = position[1];

    this.type = null;

    switch (type) {
        case 1:
            this.type = "square-tower";
            break;
        case 2:
            this.type = "round-tower";
            break;
    }
}
