"use strict";

var Cylon = require("cylon");

Cylon.robot({
  connections: {
    bean: { adaptor: "bean" }
  },

  devices: {
    bean: { driver: "bean" }
  },

  work: function(my) {
    my.bean.on("accel", function(x, y, z, valid) {
      console.log(x, y, z, valid);
    });

    every(100, function() {
      my.bean.getAcceleration();
    });
  }
}).start();
