/**
 * Provides the LSXscene class
 * @module LSXscene
 * @main LSXscene
 */

var deg2rad = Math.PI / 180;

/**
 * Class responsible for rendering a scene read from a .lsx file from a LSXParser
 * @class LSXscene
 * @extends CGFscene
 * @constructor
 */
function LSXscene() {
    CGFscene.call(this);
}

LSXscene.prototype = Object.create(CGFscene.prototype);
LSXscene.prototype.constructor = LSXscene;

/**
 * Initializes scene
 * @method init
 * @param {CGFapplication} application
 */
LSXscene.prototype.init = function(application) {
    CGFscene.prototype.init.call(this, application);

    this.initCameras();

    this.gl.clearColor(0.0, 0.0, 0.0, 1.0);

    this.gl.clearDepth(1000.0);
    this.gl.enable(this.gl.DEPTH_TEST);
    this.gl.enable(this.gl.CULL_FACE);
    this.gl.depthFunc(this.gl.LEQUAL);

    this.graph = null;

    this.textures = [];
    this.materials = [];
    this.leaves = [];
    this.anims = [];
    this.objects = [];

    this.axis = new CGFaxis(this);

    this.currTime = new Date().getTime();
    this.setUpdatePeriod(10);

    this.setPickEnabled(true);

    // HUD
    this.hud = {
        position: [0, 0],
        textObjects: [],
        add: function(text, position, fg, bg) {
            position = position || [0, 0];
            fg = fg || this.fg || [1,1,1];
            bg = bg || this.bg || [0,0,0];
            this.textObjects.push({pos: position, color: [fg,bg], text: text});
        },
        clear: function() {this.textObjects = [];},
        setFgColor: function(color) {this.fg = color;},
        setBgColor: function(color) {this.bg = color;},
        clearFgColor: function() {this.fg = null;},
        clearBgColor: function() {this.bg = null;}
    };
    this.textPlane = new MyQuad(this);
    this.textApp = new CGFappearance(this);
    this.fontTexture = new CGFtexture(this, "textures/oolite-font.png");
    this.textApp.setTexture(this.fontTexture);
    this.textShader = new CGFshader(this.gl, "shaders/font.vert", "shaders/font.frag");
    this.textShader.setUniformsValues({
        'dims': [16, 16]
    });
};

/**
 * Initializes scene camera
 * @method initCameras
 */
LSXscene.prototype.initCameras = function() {
    this.camera = new CGFcamera(0.4, 0.1, 500, vec3.fromValues(0.01, 30, 0.01), vec3.fromValues(0, 0, 0));
    this.camera.setPosition(vec3.fromValues(0.00, 20, 20));
};

/**
 * Sets the default scene appearance based on an material named "default"
 * if it is present in the .lsx scene file
 * @method setDefaultAppearance
 */
LSXscene.prototype.setDefaultAppearance = function() {
    for (var i = 0; i < this.materials.length; i++) {
        if (this.materials[i].id == "default") {
            this.materials[i].apply();
            return true;
        }
    }
    var defaultMat = new CGFappearance();
    defaultMat.apply();
    return false;
};

/**
 * Function called by a LSXParser once it is done parsing
 * a scene in .lsx format
 * @method onGraphLoaded
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
    this.textures = [];
    if (this.graph.textures.length > 0)
        this.enableTextures(true);

    var text = this.graph.textures;
    var aux;
    for (var i = 0; i < text.length; i++) {
        aux = new SceneTexture(this, text[i].id, text[i].path, text[i].amplif_factor);

        this.textures.push(aux);
    }

    // Materials
    this.materials = [];
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
    this.anims = [];
    var anims = this.graph.anims;
    for (i = 0; i < anims.length; ++i) {
        switch (anims[i].type) {
            case "linear":
                this.anims.push(new LinearAnimation(anims[i].id, anims[i].span, anims[i].args));
                break;
            case "circular":
                this.anims.push(new CircularAnimation(anims[i].id, anims[i].span,
                    anims[i].args.center,
                    anims[i].args.radius,
                    deg2rad * anims[i].args.startang,
                    deg2rad * anims[i].args.rotang));
                break;
        }
    }

    this.initNodes();

};

LSXscene.prototype.logPicking = function() {
    if (this.pickMode === false) {
        if (this.pickResults !== null && this.pickResults.length > 0) {
            for (var i = 0; i < this.pickResults.length; i++) {
                var obj = this.pickResults[i][0];
                if (obj) {
                    var customID = this.pickResults[i][1];
                    console.log("Picked object with ID " + customID);
                    this.onPickObj(obj, customID);
                }
            }
            this.pickResults = [];
        }
    }
};

/**
 * Draws the scene to the WebGL context
 * @method display
 */
LSXscene.prototype.display = function() {
    this.logPicking();
    this.clearPickRegistration();

    this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
    this.gl.clearColor(32/255, 32/255, 32/255, 1.0);
    this.gl.enable(this.gl.DEPTH_TEST);

    this.updateProjectionMatrix();
    this.loadIdentity();

    this.pushMatrix();
    {
        this.translate(this.hud.position[0], this.hud.position[1], -10);
        this.scale(0.12, 0.12, 0.1);

        for (var textObj in this.hud.textObjects) {
            var obj = this.hud.textObjects[textObj];
            this.pushMatrix();
            {
                this.translate(obj.pos[0], obj.pos[1], 0);
                this.drawText(obj.text, obj.color[0], obj.color[1]);
            }
            this.popMatrix();
        }
    }
    this.popMatrix();

    this.applyViewMatrix();

    // If LSX has been loaded
    if (this.graph.loadedOK) {

        this.setDefaultAppearance();

        if (this.axis.length !== 0) this.axis.display();

        // Apply initial transformations
        this.applyInitials();

        // Update lights
        for (var i = 0; i < this.lights.length; i++)
            this.lights[i].update();

        // Draw Objects to scene (nodes with leaves)
        var pieceID = 0, towerID = 100, obj;

        for (i = 0; i < this.objects.length; i++) {
            obj = this.objects[i];
            if (/piece/.test(obj.id)) {
                this.registerForPick(pieceID++, obj);
            }
            else if (/tower/.test(obj.id)) {
                this.registerForPick(towerID++, obj);
            }
            obj.draw(this);
        }
    }

};

/**
 * Apply the initial transformations
 * @method applyInitials
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
 * Adds lights to scene
 * @method initLights
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
 * Adds leaves (primitives) defined in LEAVES
 * @method initLeaves
 */
LSXscene.prototype.initLeaves = function() {
    this.leaves = [];
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
            case "cube":
                primitive = new MyCube(this);
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
 * Method that uses a Depth First Search algorithm to search the
 * final nodes of the graph (which should be leaves) and creates
 * a __SceneObject__ based on the transformations and materials/textures
 * defined in previous nodes and the primitive which the leaf represents
 * @method initNodes
 */
LSXscene.prototype.initNodes = function() {
    this.objects = [];
    var nodes_list = this.graph.nodes;

    var root_node = this.graph.findNode(this.graph.root_id);
    this.DFS(root_node, root_node.material, root_node.texture, root_node.matrix, root_node.anims);
};

/**
 * Depth First Search algorithm
 * @method DFS
 * @param {String} node
 * @param {String} currMaterial
 * @param {String} currTexture
 * @param {mat4} currMatrix
 * @param {Array} currAnims
 */
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

        if (nextNode === null) {
            var aux = new SceneObject(node.id);
            aux.material = this.getMaterial(nextMat);
            aux.texture = this.getTexture(nextTex);
            for (var k = 0; k < nextAnims.length; ++k) {
                var anim = this.getAnim(nextAnims[k]);
                if (anim) {
                    anim = anim.clone();
                    aux.anims.push(anim);
                }
            }
            aux.matrix = nextMatrix;
            aux.isLeaf = true;
            for (var j = 0; j < this.leaves.length; j++) {
                if (this.leaves[j].id == node.descendants[i]) {
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
 * @method getAnim
 * @param {String} id
 * @return {Animation}
 */
LSXscene.prototype.getAnim = function(id) {
    if (id === null) return null;

    for (var anim in this.anims) {
        if (id == this.anims[anim].id){
            return this.anims[anim];
        }
    }

    return null;
};

/**
 * @method getMaterial
 * @param {String} id
 * @return {SceneMaterial}
 */
LSXscene.prototype.getMaterial = function(id) {
    if (id === null) return null;

    for (var i = 0; i < this.materials.length; i++)
        if (id == this.materials[i].id) return this.materials[i];

    return null;
};

/**
 * @method getTexture
 * @param {String} id
 * @return {SceneTexture}
 */
LSXscene.prototype.getTexture = function(id) {
    if (id === null) return null;

    for (var i = 0; i < this.textures.length; i++)
        if (id == this.textures[i].id) return this.textures[i];

    return null;
};

/**
 * Called from interface when a button is pressed
 * Switches light on or off
 * @method switchLight
 * @param {String} id
 * @param {Boolean} _switch
 */
LSXscene.prototype.switchLight = function(id, _switch) {
    for (var i = 0; i < this.lights.length; ++i) {
        if (id == this.lights[i].lsxid) {
            _switch ? this.lights[i].enable() : this.lights[i].disable();
        }
    }
};

/**
 * Called based on the time provided in setUpdatePeriod()
 *
 * Updates all the objects animations
 * @method update
 * @param {Float} currTime
 */
LSXscene.prototype.update = function(currTime) {
    var delta = currTime - this.currTime;
    this.currTime = currTime;

    for (var i = 0; i < this.objects.length; ++i) {
        this.objects[i].updateAnims(delta);
    }
};

LSXscene.prototype.reloadScene = function() {
    var handler = null;
    if (this.board) {
        var self = this;
        handler = function() {
            self.onGraphLoaded();
            self.board.display(self.graph);
            self.initNodes();
        };
    }
    this.graph = new LSXParser(current_scene, this, handler);
};

LSXscene.prototype.clearHighlights = function() {
    for (var i = 0; i < this.objects.length; ++i) {
        this.objects[i].picked = false;
        this.objects[i].highlighted = false;
    }
};

LSXscene.prototype.highlightPiece = function(id, pick) {
    if (!id && id !== 0) return false;
    pick = pick || false;

    if (pick) this.pickData[id][0].picked = true;
    else this.pickData[id][0].highlighted = true;
    return true;
};

LSXscene.prototype.loadBoard = function(board) {
    this.graph.nodes = [];
    this.graph.parseNodes();
    board.display(this.graph);
    this.initNodes();
};

LSXscene.prototype.reloadBoard = function() {
    this.graph.nodes = [];
    this.graph.parseNodes();
    this.board.display(this.graph);
    this.initNodes();
};

LSXscene.prototype.drawText = function(string, fg, bg) {
    fg = fg || [1, 1, 1];
    bg = bg || [0, 0, 0];

    var prevShader = this.activeShader;
    this.setActiveShaderSimple(this.textShader);

    this.activeShader.setUniformsValues({
        'uFgColor': vec3.fromValues(fg[0], fg[1], fg[2]),
        'uBgColor': vec3.fromValues(bg[0], bg[1], bg[2])
    });

    this.textApp.apply();

    for (var i = 0; i < string.length; ++i) {
        var charCode = string.charCodeAt(i);
        var offset = [0, 2];
        if (charCode >= 32 && charCode <= 127) {
            offset[0] += (charCode - 32) % 16;
            offset[1] += Math.floor((charCode - 32) / 16);
            this.activeShader.setUniformsValues({
                'charCoords': offset
            });
            this.textPlane.display();
        }
        this.translate(1, 0, 0);
    }

    this.setActiveShaderSimple(prevShader);
};
