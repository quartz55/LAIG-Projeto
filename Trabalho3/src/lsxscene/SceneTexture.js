/**
 * Represents a LSX texture
 * @class SceneTexture
 * @extends CGFtexture
 * @constructor
 * @param {CGFscene} scene
 * @param {String} id
 * @param {String} path
 * @param {Array} amplif_factor
 */
function SceneTexture(scene, id, path, amplif_factor) {
    CGFtexture.call(this, scene, path);
    this.id = id;
    this.amplif_factor = amplif_factor;
}
SceneTexture.prototype = Object.create(CGFtexture.prototype);
SceneTexture.prototype.constructor = SceneTexture;
