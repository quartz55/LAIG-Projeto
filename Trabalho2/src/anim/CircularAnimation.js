function CircularAnimation(id, time, center, rad, iang, rang) {
    Animation.call(this, id, time);
    this.center = center;
    this.rad = rad;
    this.iang = iang;
    this.rang = rang;
}
CircularAnimation.prototype = Object.create(Animation.prototype);
CircularAnimation.prototype.constructor = CircularAnimation;
