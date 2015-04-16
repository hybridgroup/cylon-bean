"use strict";

var Cylon = require("cylon");

var Driver = module.exports = function Driver(opts) {
  Driver.__super__.constructor.apply(this, arguments);
  opts = opts || {};

  // Include a list of commands that will be made available to external APIs.
  this.commands = {
    // This is how you register a command function for the API;
    // the command should be added to the prototype, see below.
    set_color: this.setColor
  };
};

Cylon.Utils.subclass(Driver, Cylon.Driver);

Driver.prototype.start = function(callback) {
  callback();
};

Driver.prototype.halt = function(callback) {
  callback();
};

Driver.prototype.setColor = function(r, g, b) {
  this.connection.setColor(r, g, b);
};
