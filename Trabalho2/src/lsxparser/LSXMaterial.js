/**
 * Class that holds information for a LSX material
 * @class LSXMaterial
 * @constructor
 * @module LSXParser
 * @param {String} id
 */
function LSXMaterial(id) {
    this.id = id;
    this.shininess = 0.0;
    this.ambient = {
        r: 0.0,
        g: 0.0,
        b: 0.0,
        a: 0.0
    };
    this.diffuse = {
        r: 0.0,
        g: 0.0,
        b: 0.0,
        a: 0.0
    };
    this.specular = {
        r: 0.0,
        g: 0.0,
        b: 0.0,
        a: 0.0
    };
    this.emission = {
        r: 0.0,
        g: 0.0,
        b: 0.0,
        a: 0.0
    };

    this.print = function() {
        console.log("Material " + this.id);
        console.log("Shininess: " + this.shininess);
        console.log("Ambient: " + printColor(this.ambient));
        console.log("Diffuse: " + printColor(this.diffuse));
        console.log("Specular: " + printColor(this.specular));
        console.log("Emission: " + printColor(this.emission));
    };
}
