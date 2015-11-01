function LSXParser(filename, scene) {
    this.loadedOK = null;

    this.scene = scene;
    scene.graph = this;

    this.path = "scenes/" + filename;
    this.reader = new CGFXMLreader();
    this.reader.open(this.path, this);
    this.texture_path = this.path.substring(0, this.path.lastIndexOf("/")) + "/";
    console.log("LSXParser for " + this.path + ".");

    // Scene graph data
    this.initials = new LSXInitials();
    this.illumination = new LSXIllumination();
    this.lights = [];
    this.textures = [];
    this.materials = [];
    this.leaves = [];
    this.anims = [];
    this.root_id = null;
    this.nodes = [];
}

LSXParser.prototype.onXMLReady = function() {
    console.log("LSX loaded successfully.");

    var mainElement = this.reader.xmlDoc.documentElement;

    console.log("---------INITIALS----------");

    var error = this.parseInitials(mainElement);
    if (error != null) {
        this.onXMLError(error);
        return;
    }

    console.log("---------Illumination----------");

    error = this.parseIllumination(mainElement);
    if (error != null) {
        this.onXMLError(error);
        return;
    }

    console.log("---------Lights----------");

    error = this.parseLights(mainElement);
    if (error != null) {
        this.onXMLError(error);
        return;
    }

    console.log("---------Textures----------");

    error = this.parseTextures(mainElement);
    if (error != null) {
        this.onXMLError(error);
        return;
    }

    console.log("---------Materials----------");

    error = this.parseMaterials(mainElement);
    if (error != null) {
        this.onXMLError(error);
        return;
    }

    console.log("---------Leaves----------");

    error = this.parseLeaves(mainElement);
    if (error != null) {
        this.onXMLError(error);
        return;
    }

    console.log("---------Anims----------");

    error = this.parseAnims(mainElement);
    if (error != null) {
        this.onXMLError(error);
        return;
    }

    console.log("---------Nodes----------");

    error = this.parseNodes(mainElement);
    if (error != null) {
        this.onXMLError(error);
        return;
    }

    console.log("-------------------");

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

    //Translation
    var translation = initials_list.getElementsByTagName('translation')[0];
    if (translation == null) return "<translation> element is missing";

    this.initials.translation.x = this.reader.getFloat(translation, 'x');
    this.initials.translation.y = this.reader.getFloat(translation, 'y');
    this.initials.translation.z = this.reader.getFloat(translation, 'z');

    //Rotations
    var rotations = initials_list.getElementsByTagName('rotation');
    if (rotations.length != 3 || rotations == null) return "Needs 3 <rotation> elements";

    for (i = 0; i < rotations.length; i++) {
        var rot = {
            axis: null,
            angle: null
        };
        rot.axis = this.reader.getItem(rotations[i], 'axis', ['x', 'y', 'z']);
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

    this.illumination.print();

    return null;
};

LSXParser.prototype.parseLights = function(mainElement) {
    var lights_list = mainElement.getElementsByTagName('LIGHTS')[0];
    if (lights_list == null) return "<LIGHTS> element is missing.";

    var lights = lights_list.getElementsByTagName('LIGHT');
    for (i = 0; i < lights.length; i++) {
        var light = new LSXLight(this.reader.getString(lights[i], 'id'));
        light.enabled = this.reader.getBoolean(lights[i].getElementsByTagName('enable')[0], 'value');
        light.ambient = this.parseColor(lights[i].getElementsByTagName('ambient')[0]);
        light.diffuse = this.parseColor(lights[i].getElementsByTagName('diffuse')[0]);
        light.specular = this.parseColor(lights[i].getElementsByTagName('specular')[0]);

        var aux = lights[i].getElementsByTagName('position')[0];
        light.position.x = this.reader.getFloat(aux, 'x');
        light.position.y = this.reader.getFloat(aux, 'y');
        light.position.z = this.reader.getFloat(aux, 'z');
        light.position.w = this.reader.getFloat(aux, 'w');

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
        var texture = new LSXTexture(textures[i].getAttribute('id'));

        var relpath = textures[i].getElementsByTagName('file')[0].getAttribute('path');
        texture.path = this.texture_path + relpath;

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
        var mat = new LSXMaterial(materials[i].getAttribute('id'));
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

LSXParser.prototype.parseLeaves = function(mainElement) {
    var leaves_list = mainElement.getElementsByTagName('LEAVES')[0];
    if (leaves_list == null) return "<LEAVES> element is missing.";

    var leaves = leaves_list.getElementsByTagName('LEAF');
    for (i = 0; i < leaves.length; i++) {
        var leaf = new LSXLeaf(leaves[i].getAttribute('id'));
        leaf.type = this.reader.getItem(leaves[i], 'type', ['rectangle', 'cylinder', 'sphere', 'triangle']);

        var args_aux = leaves[i].getAttribute('args').split(" ");
        for (var j = 0; j < args_aux.length; j++) {
            if (args_aux[j] === ""){
                args_aux.splice(j, 1);
                --j;
            }
        }
        switch (leaf.type) {
            case "rectangle":
                if (args_aux.length != 4)
                    return "Invalid number of arguments for type 'rectangle'";

            for (var j = 0; j < args_aux.length; j++)
                    leaf.args.push(parseFloat(args_aux[j]));

                break;
            case "cylinder":
                if (args_aux.length != 5)
                    return "Invalid number of arguments for type 'cylinder'";

                leaf.args.push(parseFloat(args_aux[0]));
                leaf.args.push(parseFloat(args_aux[1]));
                leaf.args.push(parseFloat(args_aux[2]));
                leaf.args.push(parseInt(args_aux[3]));
                leaf.args.push(parseInt(args_aux[4]));
                break;
            case "sphere":
                if (args_aux.length != 3)
                    return "Invalid number of arguments for type 'sphere'";

                leaf.args.push(parseFloat(args_aux[0]));
                leaf.args.push(parseInt(args_aux[1]));
                leaf.args.push(parseInt(args_aux[2]));
                break;
            case "triangle":
                if (args_aux.length != 9)
                    return "Invalid number of arguments for type 'triangle'";

                for (j = 0; j < args_aux.length; j++)
                    leaf.args.push(parseFloat(args_aux[j]));

                break;
            default:
                return "Type " + "\"" + leaf.type + "\" not valid.";
        }

        leaf.print();
        this.leaves.push(leaf);
    }

    return null;
};

LSXParser.prototype.parseAnims = function(mainElement) {
    var anims_list = mainElement.getElementsByTagName('animations')[0];
    if (anims_list == null) return "<animations> element is missing.";

    var anims = anims_list.getElementsByTagName('animation');

    for (var i = 0; i < anims.length; ++i) {
        var id = anims[i].getAttribute('id');
        var span = this.reader.getFloat(anims[i], 'span');
        var type = this.reader.getString(anims[i], 'type');
        var args = [];

        if (type == "linear") {
            var cps = anims[i].getElementsByTagName('controlpoint');
            for (var k = 0; k < cps.length; ++k) {
                var cp = [];
                cp.push(this.reader.getFloat(cps[k], 'xx'));
                cp.push(this.reader.getFloat(cps[k], 'yy'));
                cp.push(this.reader.getFloat(cps[k], 'zz'));

                args.push(cp);
            }
        }
        else if (type == "circular") {
            args["center"] = this.reader.getVector3(anims[i], 'center');
            args["radius"] = this.reader.getFloat(anims[i], 'radius');
            args["startang"] = this.reader.getFloat(anims[i], 'startang');
            args["rotang"] = this.reader.getFloat(anims[i], 'rotang');
        }

        this.anims.push(new LSXAnim(id, span, type, args));

    }
};

LSXParser.prototype.parseNodes = function(mainElement) {
    var nodes_list = mainElement.getElementsByTagName('NODES')[0];
    if (nodes_list == null) return "<NODES> element is missing.";

    var root_node = nodes_list.getElementsByTagName('ROOT')[0];
    this.root_id = this.reader.getString(root_node, 'id');
    console.log("ROOT Node: " + this.root_id);

    var nodes = nodes_list.getElementsByTagName('NODE');

    for (i = 0; i < nodes.length; i++) {
        var node = new LSXNode(nodes[i].getAttribute('id'));
        node.material = this.reader.getString(nodes[i].getElementsByTagName('MATERIAL')[0], 'id');
        node.texture = this.reader.getString(nodes[i].getElementsByTagName('TEXTURE')[0], 'id');

        var node_anims = nodes[i].getElementsByTagName('ANIMATION');
        for (var j = 0; j < node_anims.length; ++j) {
            var anim_id = node_anims[i].getAttribute("id");
            node.anims.push(anim_id);
        }

        // Transforms
        var children = nodes[i].children;
        for (j = 0; j < children.length; j++) {
            switch (children[j].tagName) {
                case "TRANSLATION":
                    var trans = [];
                    trans.push(this.reader.getFloat(children[j], "x"));
                    trans.push(this.reader.getFloat(children[j], "y"));
                    trans.push(this.reader.getFloat(children[j], "z"));
                    // console.log("trans: " + trans);
                    mat4.translate(node.matrix, node.matrix, trans);
                    break;
                case "SCALE":
                    var scale = [];
                    scale.push(this.reader.getFloat(children[j], "sx"));
                    scale.push(this.reader.getFloat(children[j], "sy"));
                    scale.push(this.reader.getFloat(children[j], "sz"));
                    // console.log("scale: " + scale);
                    mat4.scale(node.matrix, node.matrix, scale);
                    break;
                case "ROTATION":
                    var axis = this.reader.getItem(children[j], "axis", ["x", "y", "z"]);
                    var angle = this.reader.getFloat(children[j], "angle") * deg2rad;
                    var rot = [0, 0, 0];

                    // console.log("rot: " + axis + " " + angle + " ");
                    rot[["x", "y", "z"].indexOf(axis)] = 1;
                    mat4.rotate(node.matrix, node.matrix, angle, rot);
                    break;
            }
        }

        //Descendants
        var desc = nodes[i].getElementsByTagName('DESCENDANTS')[0];
        if (desc == null) return "No <DESCENDANTS> tag found";

        var d_list = desc.getElementsByTagName('DESCENDANT');
        if (d_list.length < 1) return "Need at least 1 <DESCENDANT>";

        for (j = 0; j < d_list.length; j++) {
            node.descendants.push(d_list[j].getAttribute('id'));
        }

        // node.print();
        this.nodes.push(node);
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
LSXParser.prototype.findNode = function(id) {
    for (i = 0; i < this.nodes.length; i++)
        if (this.nodes[i].id == id) return this.nodes[i];

    return null;
};

function printColor(c) {
    return "(" + c.r + ", " + c.g + ", " + c.b + ", " + c.a + ")";
}
