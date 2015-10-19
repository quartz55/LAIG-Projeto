function SceneMaterial(scene, id) {
    CGFappearance.call(this, scene);
    this.id = id;
}
SceneMaterial.prototype = Object.create(CGFappearance.prototype);
SceneMaterial.prototype.constructor = SceneMaterial;
