function Interface() {
    CGFinterface.call(this);
};

Interface.prototype = Object.create(CGFinterface.prototype);
Interface.prototype.constructor = Interface;

/**
 * Initializes interface
 * @param {CGFapplication} application
 */
Interface.prototype.init = function(application) {
    CGFinterface.prototype.init.call(this, application);

    application.interface = this;

    this.gui = new dat.GUI();


    return true;
};

/**
 * Sets which scene the interfance belongs to, also sets the scene's interface
 * as this for easier reference
 * @param {CGFscene} scene
 */
Interface.prototype.setScene = function(scene) {
    this.scene = scene;
    scene.interface = this;
};

/**
 * Function that adds a button to control the scene lights.
 * Note: It's called when lights are created and added to the scene
 */
Interface.prototype.initLights = function() {
    var lights_group = this.gui.addFolder("Lights");
    lights_group.open();

    var self = this;

    /*
     Create a button for every light with the light's id as the name
     Every button has an event handler for when it's clicked so it updates the
     respective light in the scene
     */
    for (bool in this.scene.lightsID) {
        var handler = lights_group.add(this.scene.lightsID, bool);

        handler.onChange(function(value) {
            self.scene.switchLight(this.property, value);
        });
    }
};

Interface.prototype.initAltMaterial = function() {
    var self = this;
	
	var handler = this.gui.add(this.scene, "AltMaterial");
	
	handler.onChange(function(value) {
            self.scene.switchAltMaterial();
        });
};
