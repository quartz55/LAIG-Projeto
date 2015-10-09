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
    this.nodes = [];

    this.axis = new CGFaxis(this);
};

LSXscene.prototype.initCameras = function() {
    this.camera = new CGFcamera(0.4, 0.1, 500, vec3.fromValues(15, 15, 15), vec3.fromValues(0, 0, 0));
};

LSXscene.prototype.setDefaultAppearance = function() {
    for (var i = 0; i < this.materials.length; i++) {
        if (this.materials[i].id == "default") {
            this.materials[i].apply();
            break;
        }
    }
};

LSXscene.prototype.onGraphLoaded = function() {
    // Frustum
    this.camera.near = this.graph.initials.frustum.near;
    this.camera.far = this.graph.initials.frustum.far;

    this.axis = new CGFaxis(this, this.graph.initials.reference);

    /*
     * Illumination
     */
    // Background
    var bg_illum = this.graph.illumination.background;
    this.gl.clearColor(bg_illum.r, bg_illum.g, bg_illum.b, bg_illum.a);

    // Ambient
    var ambi_illum = this.graph.illumination.ambient;
    this.setGlobalAmbientLight(ambi_illum.r, ambi_illum.g, ambi_illum.b, ambi_illum.a);

    /*
     * Lights
     */
    this.initLights();

    /*
     * Textures
     */
    if (this.graph.textures.length > 0)
        this.enableTextures(true);

    var text = this.graph.textures;
    for (var i = 0; i < text.length; i++) {
        var aux = new SceneTexture(this, text[i].id, text[i].path, text[i].amplif_factor);

        this.textures.push(aux);
    }

    /*
     * Materials
     */
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

    /*
     * Leaves
     */
    this.initLeaves();

    /*
     * Nodes
     */
    this.initNodes();
};

LSXscene.prototype.display = function() {
    this.shader.bind();
    this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

    this.updateProjectionMatrix();
    this.loadIdentity();

    this.applyViewMatrix();

    // If LSX has been loaded
    if (this.graph.loadedOK) {

        this.setDefaultAppearance();

        if (this.axis.length != 0) this.axis.display();

        // Apply initial transforms
        this.applyInitials();

        // Lights update
        for (var i = 0; i < this.lights.length; i++)
            this.lights[i].update();

        // Nodes

        for (i = 0; i < this.nodes.length; i++) {
            var node = this.nodes[i];
            this.pushMatrix();
                node.material.setTexture(node.texture);
            if (node.texture != null) {
                node.primitive.updateTex(node.texture.amplif_factor.s, node.texture.amplif_factor.t);
            }
            node.material.apply();
            this.multMatrix(node.matrix);
            node.primitive.display();
            this.popMatrix();
        }
        // this.pushMatrix();

        // this.translate(4, 0, 4);
        // for (i = 0; i < this.leaves.length; i++) {
        //     this.leaves[i].display();
        //     this.translate(0, 0.25, 0);
        // }

        // this.popMatrix();

    };

    this.shader.unbind();
};

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

LSXscene.prototype.initLights = function() {
    this.shader.bind();

    this.lights = [];

    for (var i = 0; i < this.graph.lights.length; i++) {
        var l = this.graph.lights[i];
        var aux = new CGFlight(this, i);

        aux.id = l.id;
        l.enabled ? aux.enable() : aux.disable();
        aux.setPosition(l.position.x, l.position.y, l.position.z, l.position.w);
        aux.setAmbient(l.ambient.r, l.ambient.g, l.ambient.b, l.ambient.a);
        aux.setDiffuse(l.diffuse.r, l.diffuse.g, l.diffuse.b, l.diffuse.a);
        aux.setSpecular(l.specular.r, l.specular.g, l.specular.b, l.specular.a);
        aux.setVisible(true);
        aux.update();

        this.lights[i] = aux;
    }

    this.shader.unbind();
};

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
        }
    }
};

LSXscene.prototype.initNodes = function() {
    var nodes_list = this.graph.nodes;

    var root_node = this.graph.findNode(this.graph.root_id);
    this.auxFunc(root_node, root_node.material, root_node.texture, root_node.matrix);
};

LSXscene.prototype.auxFunc = function(node, currMaterial, currTexture, currMatrix) {
    var nextMat = node.material;
    if (node.material == "null") nextMat = currMaterial;

    var nextTex = node.texture;
    if (node.texture == "null") nextTex = currTexture;
    else if (node.texture == "clear") nextTex = null;

    var nextMatrix = mat4.create();
    mat4.multiply(nextMatrix, currMatrix, node.matrix);

    for (var i = 0; i < node.descendants.length; i++) {
        var nextNode = this.graph.findNode(node.descendants[i]);

        if (nextNode == null) {
            var aux = new SceneObject(node.descendants[i]);
            aux.material = this.getMaterial(nextMat);
            aux.texture = this.getTexture(nextTex);
            aux.matrix = nextMatrix;
            aux.isLeaf = true;
            for (var j = 0; j < this.leaves.length; j++) {
                if (this.leaves[j].id == aux.id) {
                    aux.primitive = this.leaves[j];
                    break;
                }
            }
            this.nodes.push(aux);
            continue;
        }

        this.auxFunc(nextNode, nextMat, nextTex, nextMatrix);
    }
};

LSXscene.prototype.getMaterial = function(id) {
    if (id == null) return null;

    for (var i = 0; i < this.materials.length; i++)
        if (id == this.materials[i].id) return this.materials[i];

    return null;
};

LSXscene.prototype.getTexture = function(id) {
    if (id == null) return null;

    for (var i = 0; i < this.textures.length; i++)
        if (id == this.textures[i].id) return this.textures[i];

    return null;
};

function SceneTexture(scene, id, path, amplif_factor) {
    CGFtexture.call(this, scene, path);
    this.id = id;
    this.amplif_factor = amplif_factor;
}
SceneTexture.prototype = Object.create(CGFtexture.prototype);
SceneTexture.prototype.constructor = SceneTexture;

function SceneMaterial(scene, id) {
    CGFappearance.call(this, scene);
    this.id = id;
}
SceneMaterial.prototype = Object.create(CGFappearance.prototype);
SceneMaterial.prototype.constructor = SceneMaterial;

function SceneObject(id) {
    this.id = id;
    this.material = null;
    this.texture = null;
    this.matrix = null;
    this.primitive = null;
}
