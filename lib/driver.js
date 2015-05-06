"use strict";

var Cylon = require("cylon");

var Driver = module.exports = function Driver(opts) {
  Driver.__super__.constructor.apply(this, arguments);
  opts = opts || {};

  this.commands = {
    set_led: this.setLed,
    get_led: this.getLed
  };
};

Cylon.Utils.subclass(Driver, Cylon.Driver);

Driver.prototype.start = function(callback) {
  var self = this;
  this.connection.on("accel", function(x, y, z, valid) {
    self.emit("accel", x, y, z, valid);
  });

  this.connection.on("temp", function(temp, valid) {
    self.emit("temp", temp, valid);
  });

  callback();
};

Driver.prototype.halt = function(callback) {
  callback();
};

/**
 * Sets the built-in LED to a specific color
 *
 * @param {Number} red
 * @param {Number} green
 * @param {Number} blue
 * @return {null}
 * @publish
 */
Driver.prototype.setLed = function(r, g, b) {
  this.connection.setLed(r, g, b);
};

/**
 * Reads the built-in accelerometer once
 *
 * @return {null}
 * @publish
 */
Driver.prototype.getAcceleration = function() {
  this.connection.getAcceleration();
};

/**
 * Reads the built-in thermometer once
 *
 * @return {null}
 * @publish
 */
Driver.prototype.getTemperature = function() {
  this.connection.getTemperature();
};
