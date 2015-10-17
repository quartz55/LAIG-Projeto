function Interface() {
	  CGFinterface.call(this);
};

Interface.prototype = Object.create(CGFinterface.prototype);
Interface.prototype.constructor = Interface;

/**
 * init
 * @param {CGFapplication} application
 */
Interface.prototype.init = function(application) {
	  CGFinterface.prototype.init.call(this, application);

    application.interface = this;

	  this.gui = new dat.GUI();

	  this.lights_group=this.gui.addFolder("Lights");
	  this.lights_group.open();

	  return true;
};

Interface.prototype.setScene = function(scene) {
    this.scene = scene;
    scene.interface = this;
};

Interface.prototype.addLight = function(id) {
    this.lights_group.add(id);
};
