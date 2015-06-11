"use strict";

/* eslint camelcase: 0 */

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
 * @param {Number} r the red value to set
 * @param {Number} g the green value to set
 * @param {Number} b the blue value to set
 * @return {void}
 * @publish
 */
Driver.prototype.setLed = function(r, g, b) {
  this.connection.setLed(r, g, b);
};

/**
 * Reads the built-in accelerometer once
 *
 * @return {void}
 * @publish
 */
Driver.prototype.getAcceleration = function() {
  this.connection.getAcceleration();
};

/**
 * Reads the built-in thermometer once
 *
 * @return {void}
 * @publish
 */
Driver.prototype.getTemperature = function() {
  this.connection.getTemperature();
};
