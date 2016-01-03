/**
 * Basic interface to switch lights on and off
 * @class Interface
 * @extends CGFinterface
 * @constructor
 * @module main
 */
function Interface() {
    CGFinterface.call(this);
}

Interface.prototype = Object.create(CGFinterface.prototype);
Interface.prototype.constructor = Interface;

/**
 * Initializes interface
 * @method init
 * @param {CGFapplication} application
 * @return {Boolean} True if successful, False if not
 */
Interface.prototype.init = function(application) {
    CGFinterface.prototype.init.call(this, application);

    application.interface = this;

    this.gui = new dat.GUI();

    var self = this;
    var themeBtn = {
        Theme: "",
        click: function() {
            self.game.setScene(themeBtn.Theme);
        }
    };
    var test = this.gui.add(themeBtn, 'Theme', SCENES);
    test.onChange(function() {
        themeBtn.click();
    });

    this.gui.add(this.game, 'mainMenu');
    this.gui.add(this.game, 'moveMenu');
    this.gui.add(this.game, 'sinkMenu');
    this.gui.add(this.game, 'passMenu');

    return true;
};

Interface.prototype.reload = function() {
    this.gui.destroy();
    this.gui = new dat.GUI();

};

/**
 * Sets which scene the interfance belongs to, also sets the scene's interface
 * as this for easier reference
 * @method setScene
 * @param {CGFscene} scene
 */
Interface.prototype.setScene = function(scene) {
    this.scene = scene;
    scene.interface = this;
};

/**
 * Adds a button for all the lights in the scene to switch it on or off
 * @method initLights
 */
Interface.prototype.initLights = function() {
    this.gui.removeFolder("Lights");
    var lights_group = this.gui.addFolder("Lights");
    lights_group.open();

    var self = this;

    /*
     Create a button for every light with the light's id as the name
     Every button has an event handler for when it's clicked so it updates the
     respective light in the scene
     */
    for (var bool in this.scene.lightsID) {
        var handler = lights_group.add(this.scene.lightsID, bool);

        handler.onChange(function(value) {
            self.scene.switchLight(this.property, value);
        });
    }
};

Interface.prototype.processKeyboard = function(event) {
    CGFinterface.prototype.processKeyboard.call(this,event);

    if(event.keyCode == 117) {
        this.game.undo();
    }
};

dat.GUI.prototype.removeFolder = function(name) {
    var folder = this.__folders[name];
    if (!folder) {
        return;
    }
    folder.close();
    this.__ul.removeChild(folder.domElement.parentNode);
    delete this.__folders[name];
    this.onResize();
};
