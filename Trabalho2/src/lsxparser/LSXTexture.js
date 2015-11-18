/**
 * Class that holds information for a LSX texture
 * @class LSXTexture
 * @constructor
 * @module LSXParser
 * @param {String} id
 */
function LSXTexture(id) {
    this.id = id;
    this.path = "";
    this.amplif_factor = {
        s: 0.0,
        t: 0.0
    };

    this.print = function() {
        console.log("Texture " + this.id);
        console.log("Path: " + this.path);
        console.log("Amplif Factor: " + "(s:" + this.amplif_factor.s + ", t:" + this.amplif_factor.t + ")");
    };
}
