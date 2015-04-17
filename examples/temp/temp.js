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
    my.bean.on("temp", function(temp, valid) {
      console.log(temp, valid);
    });

    every(100, function(){
    	my.bean.getTemperature();
    });
  }
}).start();
