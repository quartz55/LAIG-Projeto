/**
 * Class that holds information for the LSX scene initials
 * @class LSXInitials
 * @constructor
 * @module LSXParser
 */
function LSXInitials() {
    this.frustum = {
        near: 0.0,
        far: 0.0
    };
    this.translation = {
        x: 0.0,
        y: 0.0,
        z: 0.0
    };
    this.rotations = [];
    this.scale = {
        sx: 1.0,
        sy: 1.0,
        sz: 1.0
    };
    this.reference = 0.0;

    this.print = function() {
        console.log("Frustum (near / far): " + this.frustum.near + " / " + this.frustum.far);
        console.log("Translation: " + this.translation.x + " " + this.translation.y + " " + this.translation.z);
        for (i = 0; i < this.rotations.length; i++)
            console.log("Rotation " + (i + 1) + ": " + this.rotations[i].axis + "> " + this.rotations[i].angle);
        console.log("Scale: " + this.scale.sx + " " + this.scale.sy + " " + this.scale.sz);
        console.log("Reference: " + this.reference);
    };
}
