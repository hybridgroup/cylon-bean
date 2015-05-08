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
    every((1).second(), function(){
    	var r = Math.floor(Math.random() * 255);
    	var g = Math.floor(Math.random() * 255);
    	var b = Math.floor(Math.random() * 255);
    	my.bean.setLed(r, g, b);
    });
  }
}).start();
