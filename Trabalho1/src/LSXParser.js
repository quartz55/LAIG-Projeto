function LSXParser(filename, scene) {
    this.loadedOK = null;

    this.scene = scene;
    scene.graph = this;

    this.reader = new CGFXMLreader();

    this.initials = new Initials();
    this.illumination = new Illumination();
    this.lights = [];
    this.textures = [];
    this.materials = [];

    console.log("LSXParser for " + filename + ".");

    this.reader.open('scenes/' + filename, this);
}

LSXParser.prototype.onXMLReady = function() {
    console.log("LSX loaded successfully.");

    var mainElement = this.reader.xmlDoc.documentElement;

    var error = this.parseInitials(mainElement);
    if (error != null) {
        this.onXMLError(error);
        return;
    }

    error = this.parseIllumination(mainElement);
    if (error != null) {
        this.onXMLError(error);
        return;
    }

    error = this.parseLights(mainElement);
    if (error != null) {
        this.onXMLError(error);
        return;
    }

    error = this.parseTextures(mainElement);
    if (error != null) {
        this.onXMLError(error);
        return;
    }

    error = this.parseMaterials(mainElement);
    if (error != null) {
        this.onXMLError(error);
        return;
    }

    this.loadedOK = true;
    this.scene.onGraphLoaded();
};

LSXParser.prototype.onXMLError = function(message) {
    console.error("LSX loading error: " + message);
    this.loadedOK = false;
};

LSXParser.prototype.parseInitials = function(mainElement) {
    var initials_list = mainElement.getElementsByTagName('INITIALS')[0];
    if (initials_list == null) return "<INITIALS> element is missing.";

    // Frustum
    var frustum = initials_list.getElementsByTagName('frustum')[0];
    if (frustum == null) return "<frustum> element is missing";

    this.initials.frustum.near = this.reader.getFloat(frustum, 'near');
    this.initials.frustum.far = this.reader.getFloat(frustum, 'far');

    //Translate
    var translate = initials_list.getElementsByTagName('translate')[0];
    if (translate == null) return "<translate> element is missing";

    this.initials.translate.x = this.reader.getFloat(translate, 'x');
    this.initials.translate.y = this.reader.getFloat(translate, 'y');
    this.initials.translate.z = this.reader.getFloat(translate, 'z');

    //Rotations
    var rotations = initials_list.getElementsByTagName('rotation');
    if (rotations.length != 3 || rotations == null) return "Needs 3 <rotation> elements";

    for (i = 0; i < rotations.length; i++) {
        var rot = {axis: null, angle: null};
        rot.axis = this.reader.getItem(rotations[i], 'axis', ['x','y','z']);
        rot.angle = this.reader.getFloat(rotations[i], 'angle');
        this.initials.rotations.push(rot);
    }

    //Scale
    var scale = initials_list.getElementsByTagName('scale')[0];
    if (scale == null) return "<scale> element is missing";
    this.initials.scale.sx = this.reader.getFloat(scale, 'sx');
    this.initials.scale.sy = this.reader.getFloat(scale, 'sy');
    this.initials.scale.sz = this.reader.getFloat(scale, 'sz');

    //Reference length
    var r_length = initials_list.getElementsByTagName('reference')[0];
    if (r_length == null) return "<reference> element is missing";

    this.initials.reference = this.reader.getFloat(r_length, 'length');

    this.initials.print();

    return null;
};


LSXParser.prototype.parseIllumination = function(mainElement) {
    var illumination_list = mainElement.getElementsByTagName('ILLUMINATION')[0];
    if (illumination_list == null) return "<ILLUMINATION> element is missing.";

    //Ambient
    var ambient = illumination_list.getElementsByTagName('ambient')[0];
    if (ambient == null) return "<ambient> element is missing";

    this.illumination.ambient = this.parseColor(ambient);

    //Background
    var background = illumination_list.getElementsByTagName('background')[0];
    if (background == null) return "<background> element is missing";

    this.illumination.background = this.parseColor(background);

    //Doubleside
    var doubleside = illumination_list.getElementsByTagName('doubleside')[0];
    if (doubleside == null) return "<doubleside> element is missing";

    this.illumination.doubleside = this.reader.getBoolean(doubleside, 'value');

    this.illumination.print();

    return null;
};

LSXParser.prototype.parseLights = function(mainElement) {
    var lights_list = mainElement.getElementsByTagName('LIGHTS')[0];
    if (lights_list == null) return "<LIGHTS> element is missing.";

    var lights = lights_list.getElementsByTagName('LIGHT');
    for (i = 0; i < lights.length; i++) {
        var light = new Light(lights[i].id);
        light.enabled = this.reader.getBoolean(lights[i].getElementsByTagName('enable')[0], 'value');
        light.ambient = this.parseColor(lights[i].getElementsByTagName('ambient')[0]);
        light.diffuse = this.parseColor(lights[i].getElementsByTagName('diffuse')[0]);
        light.specular = this.parseColor(lights[i].getElementsByTagName('specular')[0]);

        var temp_position = {};
        var aux = lights[i].getElementsByTagName('position')[0];
        temp_position.x = this.reader.getFloat(aux, 'x');
        temp_position.y = this.reader.getFloat(aux, 'y');
        temp_position.z = this.reader.getFloat(aux, 'z');
        temp_position.w = this.reader.getFloat(aux, 'w');

        light.position = temp_position;

        light.print();
        this.lights.push(light);
    }

    return null;
};

LSXParser.prototype.parseTextures = function(mainElement) {
    var textures_list = mainElement.getElementsByTagName('TEXTURES')[0];
    if (textures_list == null) return "<TEXTURES> element is missing.";

    var textures = textures_list.getElementsByTagName('TEXTURE');
    for (i = 0; i < textures.length; i++) {
        var texture = new Texture(textures[i].id);

        var file = textures[i].getElementsByTagName('file')[0];
        texture.path = this.reader.getString(file, 'path');

        var aux = textures[i].getElementsByTagName('amplif_factor')[0];
        texture.amplif_factor.s = this.reader.getFloat(aux, 's');
        texture.amplif_factor.t = this.reader.getFloat(aux, 't');

        texture.print();
        this.textures.push(texture);
    }

    return null;
};

LSXParser.prototype.parseMaterials = function(mainElement) {
    var materials_list = mainElement.getElementsByTagName('MATERIALS')[0];
    if (materials_list == null) return "<MATERIALS> element is missing.";

    var materials = materials_list.getElementsByTagName('MATERIAL');
    for (i = 0; i < materials.length; i++) {
        var mat = new Material(materials[i].id);
        mat.ambient = this.parseColor(materials[i].getElementsByTagName('ambient')[0]);
        mat.diffuse = this.parseColor(materials[i].getElementsByTagName('diffuse')[0]);
        mat.specular = this.parseColor(materials[i].getElementsByTagName('specular')[0]);
        mat.emission = this.parseColor(materials[i].getElementsByTagName('emission')[0]);

        mat.shininess = this.reader.getFloat(materials[i].getElementsByTagName('shininess')[0], 'value');

        mat.print();
        this.materials.push(mat);
    }

    return null;
};

LSXParser.prototype.parseColor = function(element) {
    var color = {};
    color.r = this.reader.getFloat(element, 'r');
    color.g = this.reader.getFloat(element, 'g');
    color.b = this.reader.getFloat(element, 'b');
    color.a = this.reader.getFloat(element, 'a');
    return color;
};


/*
 * Data structures
 */
function Initials() {
    this.frustum = {near: null, far: null};
    this.translate = {x: 0, y: 0, z: 0};
    this.rotations = [];
    this.scale = {sx: 1, sy: 1, sz: 1};
    this.reference = 0;

    this.print = function() {
        console.log("Frustum (near / far): " + this.frustum.near + " / " + this.frustum.far);
        console.log("Translate: " + this.translate.x + " " + this.translate.y + " " + this.translate.z);
        for (i = 0; i < this.rotations.length; i++)
            console.log("Rotation " + (i+1) + ": " + this.rotations[i].axis + "> " + this.rotations[i].angle);
        console.log("Scale: " + this.scale.sx + " " + this.scale.sy + " " + this.scale.sz);
        console.log("Reference: " + this.reference);
    };
}

function Illumination() {
    this.ambient = {r:1, g:1, b:1, a:1};
    this.background = {r:0, g:0, b:0, a:1};
    this.doubleside = false;

    this.print = function() {
        console.log("Ambient: " + printColor(this.ambient));
        console.log("Background: " + printColor(this.background));
        console.log("Doubleside: " + (this.doubleside ? "Yes" : "No"));
    };
}

function Light(id) {
    this.id = id;
    this.enabled = false;
    this.position = {x:0.0, y:0.0, z:0.0, w:0.0};
    this.ambient = {r:0.0, g:0.0, b:0.0, a:0.0};
    this.diffuse = {r:0.0, g:0.0, b:0.0, a:0.0};
    this.specular = {r:0.0, g:0.0, b:0.0, a:0.0};

    this.setColor = function(which, color){
        this[which] = color;
    };

    this.print = function() {
        console.log("Light " + this.id + " - " + (this.enabled ? "On" : "Off"));
        console.log("Position: " + this.position.x + " " + this.position.y + " " + this.position.z + " " + this.position.w);
        console.log("Ambient: " + printColor(this.ambient));
        console.log("Diffuse: " + printColor(this.diffuse));
        console.log("Specular: " + printColor(this.specular));
    };
}

function Texture(id) {
    this.id = id;
    this.path = "";
    this.amplif_factor = {s:0.0, t:0.0};

    this.print = function() {
        console.log("Texture " + this.id);
        console.log("Path: " + this.path);
        console.log("Amplif Factor: " + "(s:" + this.amplif_factor.s + ", t:" + this.amplif_factor.t + ")");
    };
}

function Material(id) {
    this.id = id;
    this.shininess = 0.0;
    this.ambient = {r:0.0, g:0.0, b:0.0, a:0.0};
    this.diffuse = {r:0.0, g:0.0, b:0.0, a:0.0};
    this.specular = {r:0.0, g:0.0, b:0.0, a:0.0};
    this.emission = {r:0.0, g:0.0, b:0.0, a:0.0};

    this.print = function() {
        console.log("Material " + this.id);
        console.log("Shininess: " + this.shininess);
        console.log("Ambient: " + printColor(this.ambient));
        console.log("Diffuse: " + printColor(this.diffuse));
        console.log("Specular: " + printColor(this.specular));
        console.log("Emission: " + printColor(this.emission));
    };
}

var printColor = function(c){
    return "("+ c.r + ", " + c.g + ", " + c.b + ", " + c.a + ")";
};
