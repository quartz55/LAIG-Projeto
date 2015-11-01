function SceneObject(id) {
    this.id = id;
    this.material = null;
    this.texture = null;
    this.matrix = null;
    this.primitive = null;
    this.anims = [];
}

SceneObject.prototype.updateTex = function() {
    this.material.setTexture(this.texture);

    if (this.texture == null) return;

    this.primitive.updateTex(this.texture.amplif_factor.s, this.texture.amplif_factor.t);
};

SceneObject.prototype.draw = function(scene) {
    scene.pushMatrix();
    this.updateTex();
    this.material.apply();

    // Anims transformations
    for (var i = 0; i < this.anims.length; ++i)
        scene.multMatrix(this.anims[i].matrix);

    scene.multMatrix(this.matrix);

    this.primitive.display();
    scene.popMatrix();
};
