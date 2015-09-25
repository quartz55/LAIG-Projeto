function LSXParser(filename, scene) {
    this.loadedOK = null;

    this.scene = scene;
    scene.graph = this;

    this.reader = new CGFXMLreader();

    this.initials = new Initials();
    this.illumination = new Illumination();

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

    this.loadedOK = true;
    this.scene.onGraphLoaded();
};

LSXParser.prototype.onXMLError = function(message) {
    console.error("LSX loading error: " + message);
    this.loadedOK = false;
};

LSXParser.prototype.parseInitials = function(mainElement) {
    var initials_list = mainElement.getElementsByTagName('INITIALS');
    if (initials_list == null || initials_list.length == 0)
        return "<INITIALS> element is missing.";

    initials_list = initials_list[0];

    // Frustum
    var frustum = initials_list.getElementsByTagName('frustum');
    if (frustum.length < 1 || frustum == null) return "No <frustum> tag.";
    frustum = frustum[0];

    this.initials.frustum.near = this.reader.getFloat(frustum, 'near');
    this.initials.frustum.far = this.reader.getFloat(frustum, 'far');

    //Translate
    var translate = initials_list.getElementsByTagName('translate');
    if (translate.length != 1 || translate == null) return "No <translate> tag.";
    translate = translate[0];

    this.initials.translate.x = this.reader.getFloat(translate, 'x');
    this.initials.translate.y = this.reader.getFloat(translate, 'y');
    this.initials.translate.z = this.reader.getFloat(translate, 'z');

    //Rotations
    var rotations = initials_list.getElementsByTagName('rotation');
    if (rotations.length != 3 || rotations == null) return "Not enough <rotation> tags.";

    for (i = 0; i < rotations.length; i++) {
        var rot = {axis: null, angle: null};
        rot.axis = this.reader.getItem(rotations[i], 'axis', ['x','y','z']);
        rot.angle = this.reader.getFloat(rotations[i], 'angle');
        this.initials.rotations.push(rot);
    }

    //Scale
    var scale = initials_list.getElementsByTagName('scale');
    if (scale.length != 1 || scale == null) return "No <scale> tag.";
    scale = scale[0];
    this.initials.scale.sx = this.reader.getFloat(scale, 'sx');
    this.initials.scale.sy = this.reader.getFloat(scale, 'sy');
    this.initials.scale.sz = this.reader.getFloat(scale, 'sz');

    //Reference length
    var r_length = initials_list.getElementsByTagName('reference');
    if (r_length.length != 1 || r_length == null) return "No <reference> tag.";

    this.initials.reference = this.reader.getFloat(r_length[0], 'length');

    this.initials.print();

    return null;
};


LSXParser.prototype.parseIllumination = function(mainElement) {
    var illumination_list = mainElement.getElementsByTagName('ILLUMINATION');
    if (illumination_list == null || illumination_list.length == 0)
        return "<ILLUMINATION> element is missing.";

    illumination_list = illumination_list[0];

    //Ambient
    var ambient = illumination_list.getElementsByTagName('ambient');
    if (ambient.length != 1 || ambient == null) return "No <ambient> tag.";
    ambient = ambient[0];

    this.illumination.ambient.r = this.reader.getFloat(ambient, 'r');
    this.illumination.ambient.g = this.reader.getFloat(ambient, 'g');
    this.illumination.ambient.b = this.reader.getFloat(ambient, 'b');
    this.illumination.ambient.a = this.reader.getFloat(ambient, 'a');

    //Background
    var background = illumination_list.getElementsByTagName('background');
    if (background.length != 1 || background == null) return "No <background> tag.";
    background = background[0];

    this.illumination.background.r = this.reader.getFloat(background, 'r');
    this.illumination.background.g = this.reader.getFloat(background, 'g');
    this.illumination.background.b = this.reader.getFloat(background, 'b');
    this.illumination.background.a = this.reader.getFloat(background, 'a');

    //Doubleside
    var doubleside = illumination_list.getElementsByTagName('doubleside');
    if (doubleside.length != 1 || doubleside == null) return "No <doubleside> tag.";
    doubleside = doubleside[0];

    this.illumination.doubleside = this.reader.getBoolean(doubleside, 'value');

    this.illumination.print();

    return null;
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
    this.background = {r:1, g:1, b:1, a:1};
    this.doubleside = false;

    this.printColor = function(c){
        return (c.r + ", " + c.g + ", " + c.b + ", " + c.a);
    };

    this.print = function() {
        console.log("Ambient: " + this.printColor(this.ambient));
        console.log("Background: " + this.printColor(this.background));
        console.log("Doubleside: " + (this.doubleside ? "Yes" : "No"));
    };
}
