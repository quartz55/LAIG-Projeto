/**
 * Represents a LSX material
 * @class SceneMaterial
 * @extends CGFappearance
 * @constructor
 * @param {CGFscene} scene
 * @param {String} id
 */
function SceneMaterial(scene, id) {
    CGFappearance.call(this, scene);
    this.id = id;
}
SceneMaterial.prototype = Object.create(CGFappearance.prototype);
SceneMaterial.prototype.constructor = SceneMaterial;
