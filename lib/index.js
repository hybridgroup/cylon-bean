"use strict";

var Adaptor = require("./adaptor"),
    Driver = require("./driver");

module.exports = {
  // Adaptors your module provides, e.g. ["spark"]
  adaptors: ["bean"],

  // Drivers your module provides, e.g. ["led", "button"]
  drivers: ["bean"],

  // Modules intended to be used with yours, e.g. ["cylon-gpio"]
  dependencies: ["cylon-gpio"],

  adaptor: function(opts) {
    return new Adaptor(opts);
  },

  driver: function(opts) {
    return new Driver(opts);
  }
};
