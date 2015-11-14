var deg2rad = Math.PI / 180;

function LSXscene() {
    CGFscene.call(this);
}

LSXscene.prototype = Object.create(CGFscene.prototype);
LSXscene.prototype.constructor = LSXscene;

LSXscene.prototype.init = function(application) {
    CGFscene.prototype.init.call(this, application);

    this.initCameras();

    this.gl.clearColor(0.0, 0.0, 0.0, 1.0);

    this.gl.clearDepth(100.0);
    this.gl.enable(this.gl.DEPTH_TEST);
    this.gl.enable(this.gl.CULL_FACE);
    this.gl.depthFunc(this.gl.LEQUAL);
    this.textures = [];
    this.materials = [];
    this.leaves = [];
    this.anims = [];
    this.objects = [];
    this.axis = new CGFaxis(this);
    this.currTime = new Date().getTime();
    this.setUpdatePeriod(10);
};
LSXscene.prototype.initCameras = function() {
    this.camera = new CGFcamera(0.4, 0.1, 500, vec3.fromValues(50, 10, 10), vec3.fromValues(0, 0, 0));
};
/**
 * Sets the default scene appearance based on an material named "default"
 * if it is present in the .lsx scene file
 */
LSXscene.prototype.setDefaultAppearance = function() {
    for (var i = 0; i < this.materials.length; i++) {
        if (this.materials[i].id == "default") {
            this.materials[i].apply();
            break;
        }
    }
};

/**
 * Function called by a {LSXParser} once it is done parsing
 * a scene in .lsx format
 */
LSXscene.prototype.onGraphLoaded = function() {
    // Frustum
    this.camera.near = this.graph.initials.frustum.near;
    this.camera.far = this.graph.initials.frustum.far;

    this.axis = new CGFaxis(this, this.graph.initials.reference);

    // Illumination
    var bg_illum = this.graph.illumination.background;
    this.gl.clearColor(bg_illum.r, bg_illum.g, bg_illum.b, bg_illum.a);

    var ambi_illum = this.graph.illumination.ambient;
    this.setGlobalAmbientLight(ambi_illum.r, ambi_illum.g, ambi_illum.b, ambi_illum.a);

    // Lights
    this.initLights();

    // Textures
    if (this.graph.textures.length > 0)
        this.enableTextures(true);

    var text = this.graph.textures;
    for (var i = 0; i < text.length; i++) {
        var aux = new SceneTexture(this, text[i].id, text[i].path, text[i].amplif_factor);

        this.textures.push(aux);
    }

    // Materials
    var mat = this.graph.materials;
    for (i = 0; i < mat.length; i++) {
        aux = new SceneMaterial(this, mat[i].id);
        aux.setAmbient(mat[i].ambient.r, mat[i].ambient.g, mat[i].ambient.b, mat[i].ambient.a);
        aux.setDiffuse(mat[i].diffuse.r, mat[i].diffuse.g, mat[i].diffuse.b, mat[i].diffuse.a);
        aux.setSpecular(mat[i].specular.r, mat[i].specular.g, mat[i].specular.b, mat[i].specular.a);
        aux.setEmission(mat[i].emission.r, mat[i].emission.g, mat[i].emission.b, mat[i].emission.a);
        aux.setShininess(mat[i].shininess);

        this.materials.push(aux);
    }

    // Leaves
    this.initLeaves();

    // Anims
    var anims = this.graph.anims;
    for (i = 0; i < anims.length; ++i) {
        switch (anims[i].type) {
            case "linear":
                this.anims.push(new LinearAnimation(anims[i].id, anims[i].span, anims[i].args));
                break;
            case "circular":
                this.anims.push(new CircularAnimation(anims[i].id, anims[i].span,
                    anims[i].args["center"],
                    anims[i].args["radius"],
                    deg2rad * anims[i].args["startang"],
                    deg2rad * anims[i].args["rotang"]));
                break;
        }
    }

    // Nodes
    this.initNodes();
};

LSXscene.prototype.display = function() {
    this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

    this.updateProjectionMatrix();
    this.loadIdentity();

    this.applyViewMatrix();

    // If LSX has been loaded
    if (this.graph.loadedOK) {

        this.setDefaultAppearance();

        if (this.axis.length != 0) this.axis.display();

        // Apply initial transformations
        this.applyInitials();

        // Update lights
        for (var i = 0; i < this.lights.length; i++)
            this.lights[i].update();

        // Draw Objects to scene (nodes with leaves)
        for (i = 0; i < this.objects.length; i++) {
            var obj = this.objects[i];
            obj.draw(this);
        }
    }

};

/**
 * Apply the initial transformations defined in <INITIALS>
 */
LSXscene.prototype.applyInitials = function() {
    var inits = this.graph.initials;
    var trans = inits.translation;
    var scale = inits.scale;
    var rots = inits.rotations;

    this.translate(trans.x, trans.y, trans.z);
    for (var i = 0; i < rots.length; i++) {
        switch (rots[i].axis) {
            case 'x':
                this.rotate(rots[i].angle * deg2rad, 1, 0, 0);
                break;
            case 'y':
                this.rotate(rots[i].angle * deg2rad, 0, 1, 0);
                break;
            case 'z':
                this.rotate(rots[i].angle * deg2rad, 0, 0, 1);
                break;
        }
    }
    this.scale(scale.sx, scale.sy, scale.sz);
};

/**
 * Adds lights to scene defined in <LIGHTS>
 */
LSXscene.prototype.initLights = function() {
    this.lights = [];
    this.lightsID = [];

    for (var i = 0; i < this.graph.lights.length; i++) {
        var l = this.graph.lights[i];
        var aux = new CGFlight(this, i);

        aux.lsxid = l.id;
        l.enabled ? aux.enable() : aux.disable();
        aux.setPosition(l.position.x, l.position.y, l.position.z, l.position.w);
        aux.setAmbient(l.ambient.r, l.ambient.g, l.ambient.b, l.ambient.a);
        aux.setDiffuse(l.diffuse.r, l.diffuse.g, l.diffuse.b, l.diffuse.a);
        aux.setSpecular(l.specular.r, l.specular.g, l.specular.b, l.specular.a);
        aux.setVisible(true);
        aux.update();

        this.lights[i] = aux;
        this.lightsID[l.id] = l.enabled;
    }

    this.interface.initLights();

};

/**
 * Adds leaves (primitives) defined in <LEAVES>
 */
LSXscene.prototype.initLeaves = function() {
    for (var i = 0; i < this.graph.leaves.length; i++) {
        var leaf = this.graph.leaves[i];
        switch (leaf.type) {
            case "rectangle":
                var primitive = new MyQuad(this, leaf.args);
                primitive.id = leaf.id;
                this.leaves.push(primitive);
                break;
            case "cylinder":
                primitive = new MyFullCylinder(this, leaf.args);
                primitive.id = leaf.id;
                this.leaves.push(primitive);
                break;
            case "sphere":
                primitive = new MySphere(this, leaf.args);
                primitive.id = leaf.id;
                this.leaves.push(primitive);
                break;
            case "triangle":
                primitive = new MyTriangle(this, leaf.args);
                primitive.id = leaf.id;
                this.leaves.push(primitive);
                break;
            case "plane":
                primitive = new MyPlane(this, leaf.args);
                primitive.id = leaf.id;
                this.leaves.push(primitive);
                break;
            case "terrain":
                primitive = new MyTerrain(this, leaf.args);
                primitive.id = leaf.id;
                this.leaves.push(primitive);
                break;
            case "vehicle":
                primitive = new MyVehicle(this);
                primitive.id = leaf.id;
                this.leaves.push(primitive);
                break;
            case "patch":
                primitive = new MyPatch(this, leaf.args);
                primitive.id = leaf.id;
                this.leaves.push(primitive);
                break;
        }
    }
};

/**
 * @brief Function that parses the graph defined in the <NODES> section.
 *
 * It uses a Depth First Search algorithm to search for the
 * final nodes of the graph (which should be leaves) and creates
 * a {SceneObject} based on the transformations and materials/textures
 * defined in previous nodes and the primitive which the leaf represents
 */
LSXscene.prototype.initNodes = function() {
    var nodes_list = this.graph.nodes;

    var root_node = this.graph.findNode(this.graph.root_id);
    this.DFS(root_node, root_node.material, root_node.texture, root_node.matrix, root_node.anims);
};

LSXscene.prototype.DFS = function(node, currMaterial, currTexture, currMatrix, currAnims) {
    var nextMat = node.material;
    if (node.material == "null") nextMat = currMaterial;

    var nextTex = node.texture;
    if (node.texture == "null") nextTex = currTexture;
    else if (node.texture == "clear") nextTex = null;

    var nextMatrix = mat4.create();
    mat4.multiply(nextMatrix, currMatrix, node.matrix);

    var nextAnims = currAnims.concat(node.anims);

    for (var i = 0; i < node.descendants.length; i++) {
        var nextNode = this.graph.findNode(node.descendants[i]);

        if (nextNode == null) {
            var aux = new SceneObject(node.descendants[i]);
            aux.material = this.getMaterial(nextMat);
            aux.texture = this.getTexture(nextTex);
            for (var k = 0; k < nextAnims.length; ++k) {
                var anim = this.getAnim(nextAnims[k]).clone();
                aux.anims.push(anim);
            }
            aux.matrix = nextMatrix;
            aux.isLeaf = true;
            for (var j = 0; j < this.leaves.length; j++) {
                if (this.leaves[j].id == aux.id) {
                    aux.primitive = this.leaves[j];
                    break;
                }
            }
            this.objects.push(aux);
            continue;
        }

        this.DFS(nextNode, nextMat, nextTex, nextMatrix, nextAnims);
    }
};

/**
 * @returns {Anim} with the {string} id specified
 */
LSXscene.prototype.getAnim = function(id) {
    if (id == null) return null;

    for (var i = 0; i < this.anims.length; ++i)
        if (id == this.anims[i].id) return this.anims[i];

    return null;
};

/**
 * @returns {SceneMaterial} with the {string} id specified
 */
LSXscene.prototype.getMaterial = function(id) {
    if (id == null) return null;

    for (var i = 0; i < this.materials.length; i++)
        if (id == this.materials[i].id) return this.materials[i];

    return null;
};

/**
 * @returns {SceneTexture} with the {string} id specified
 */
LSXscene.prototype.getTexture = function(id) {
    if (id == null) return null;

    for (var i = 0; i < this.textures.length; i++)
        if (id == this.textures[i].id) return this.textures[i];

    return null;
};

/**
 * Called from interface when a button is pressed
 * Switches light on or off
 */
LSXscene.prototype.switchLight = function(id, _switch) {
    for (var i = 0; i < this.lights.length; ++i) {
        if (id == this.lights[i].lsxid) {
            _switch ? this.lights[i].enable() : this.lights[i].disable();
        }
    }
};

LSXscene.prototype.update = function(currTime) {
    var delta = currTime - this.currTime;
    this.currTime = currTime;

    for (var i = 0; i < this.objects.length; ++i)
        this.objects[i].updateAnims(delta);
};
