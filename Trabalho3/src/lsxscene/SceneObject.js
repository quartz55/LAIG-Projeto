/**
 * @constructor
 * @class SceneObject
 * @method SceneObject
 * @param {} id
 * @return
 */
function SceneObject(id) {
    this.id = id;
    this.material = null;
    this.texture = null;
    this.matrix = null;
    this.primitive = null;
    this.anims = [];
    this.currAnim = 0;
    this.picked = false;
    this.highlighted = false;
}

/**
 * Description
 * @method updateTex
 * @return
 */
SceneObject.prototype.updateTex = function() {
    this.material.setTexture(this.texture);

    if (this.texture === null) return;

    this.primitive.updateTex(this.texture.amplif_factor.s, this.texture.amplif_factor.t);
};

/**
 * Description
 * @method draw
 * @param {} scene
 * @return
 */
SceneObject.prototype.draw = function(scene) {
    scene.pushMatrix();
    this.updateTex();
    if (this.picked) {
        var pickMat = new CGFappearance(scene);
        pickMat.setEmission(1, 0.4, 0.1, 1);
        pickMat.setShininess(100);
        pickMat.setTexture(this.texture);
        pickMat.apply();
    }
    else if (this.highlighted) {
        var highlightMat = new CGFappearance(scene);
        highlightMat.setEmission(0.1, 0.5, 0.2, 1);
        highlightMat.setShininess(100);
        highlightMat.setTexture(this.texture);
        highlightMat.apply();
    }
    else {
        this.material.apply();
    }

    // Animation transformations
    if (this.currAnim < this.anims.length) {
        scene.multMatrix(this.anims[this.currAnim].matrix);
    }

    scene.multMatrix(this.matrix);

    this.primitive.display();
    scene.popMatrix();
};

/**
 * Description
 * @method updateAnims
 * @param {} delta
 * @return
 */
SceneObject.prototype.updateAnims = function(delta) {
    if (this.anims.length === 0 || this.currAnim >= this.anims.length) return;

    if (this.anims[this.currAnim].done) ++this.currAnim;
    if(this.currAnim < this.anims.length) this.anims[this.currAnim].update(delta);
};
