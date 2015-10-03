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

    this.axis = new CGFaxis(this);
};

LSXscene.prototype.initCameras = function() {
    this.camera = new CGFcamera(0.4, 0.1, 500, vec3.fromValues(15, 15, 15), vec3.fromValues(0, 0, 0));
};

LSXscene.prototype.setDefaultAppearance = function() {
    this.setAmbient(0.2, 0.4, 0.8, 1.0);
    this.setDiffuse(0.2, 0.4, 0.8, 1.0);
    this.setSpecular(0.2, 0.4, 0.8, 1.0);
    this.setShininess(10.0);
};

LSXscene.prototype.onGraphLoaded = function() {

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
        this.enableTextures();

    this.textures = [];
    var text = this.graph.textures;
    for ( i = 0; i < text.length; i++) {
        var aux = new CGFappearance(this);
        aux.id = text[i].id;
        aux.loadTexture(text[i].path);
        aux.setTextureWrap(text[i].amplif_factor.s, text[i].amplif_factor.t);

        this.textures[i] = aux;
    }

    /*
     * Materials
     */
    this.materials = [];
    var mat = this.graph.materials;
    for (i = 0; i < mat.length; i++) {
        var aux = new CGFappearance(this);
        aux.id = mat[i].id;
        aux.setAmbient(mat[i].ambient.r, mat[i].ambient.g, mat[i].ambient.b, mat[i].ambient.a);
        aux.setDiffuse(mat[i].diffuse.r, mat[i].diffuse.g, mat[i].diffuse.b, mat[i].diffuse.a);
        aux.setSpecular(mat[i].specular.r, mat[i].specular.g, mat[i].specular.b, mat[i].specular.a);
        aux.setEmission(mat[i].emission.r, mat[i].emission.g, mat[i].emission.b, mat[i].emission.a);
        aux.setShininess(mat[i].shininess);

        this.materials[i] = aux;
    }
};

LSXscene.prototype.display = function() {
    // ---- BEGIN Background, camera and axis setup
    this.shader.bind();

    // Clear image and depth buffer everytime we update the scene
    this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

    // Initialize Model-View matrix as identity (no transformation
    this.updateProjectionMatrix();
    this.loadIdentity();

    // Apply transformations corresponding to the camera position relative to the origin
    this.applyViewMatrix();

    this.setDefaultAppearance();

    // Lights update
    if (this.graph.loadedOK) {
        this.applyInitials();
        for (var i = 0; i < this.lights.length; i++)
            this.lights[i].update();
    };

    if (this.axis.length != 0) this.axis.display();

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
