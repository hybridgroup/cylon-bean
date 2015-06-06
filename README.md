# Cylon.js For LightBlue Bean

Cylon.js (http://cylonjs.com) is a JavaScript framework for robotics, physical computing, and the Internet of Things.

This module provides an adaptor and driver for the [LightBlue Bean](https://punchthrough.com/bean/) from Punch Through Design. The implementation uses the [bean-serial](https://github.com/monteslu/bean-serial) node module from [@monteslu](https://github.com/monteslu/), which in turn uses the [ble-bean](https://github.com/jacobrosenthal/ble-bean) node module from [@jacobrosenthal](https://github.com/jacobrosenthal/). Thank you both very much!

Want to use Ruby on robots? Check out our sister project Artoo (http://artoo.io)

Want to use the Go programming language to power your robots? Check out our sister project Gobot (http://gobot.io).

[![Build Status](https://secure.travis-ci.org/hybridgroup/cylon-bean.png?branch=master)](http://travis-ci.org/hybridgroup/cylon-bean) [![Code Climate](https://codeclimate.com/github/hybridgroup/cylon-bean/badges/gpa.svg)](https://codeclimate.com/github/hybridgroup/cylon-bean) [![Test Coverage](https://codeclimate.com/github/hybridgroup/cylon-bean/badges/coverage.svg)](https://codeclimate.com/github/hybridgroup/cylon-bean)

## How to Install

Install the module with:

    $ npm install cylon cylon-bean

### Installing Firmata Firmware On Your LightBlue Bean

To use the complete functionality of your Bean, you will need to install the Firmata sketch on the Bean itself using the Bean loader. Install it, by following the instructions for your operating system on the LightBlue site:

- For OSX go to [http://punchthrough.com/bean/getting-started-osx/](http://punchthrough.com/bean/getting-started-osx/)
- For Windows 8.1+ go to [http://punchthrough.com/bean/getting-started-windows/](http://punchthrough.com/bean/getting-started-windows/)
- Linux is not yet supported for LightBlue Bean firmware updates. You can connect to Bean as a client from Linux, just not update the firmware (yet).

## How to Use

You can connect to the built-in LED, accelerometer, and thermometer of the Bean, by using the `bean` driver:

```javascript
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
```

You can also connect to GPIO and i2c devices using the `bean` adaptor:

```javascript
var Cylon = require("cylon");

Cylon.robot({
  connections: {
    bean: { adaptor: "bean" }
  },

  devices: {
    led: { driver: "led", pin: 5 }
  },

  work: function(my) {
    every((1).second(), my.led.toggle);
  }
}).start();
```

## How to Connect

The LightBlue Bean is a Bluetooth LE device. By default you will connect to the first Bean, for example:

```javascript
Cylon.robot({
  connections: {
    bean: { adaptor: "bean" }
  }
...
```

If you want to connect to a specific Bean, use the `beanName` parameter like this:

```javascript
Cylon.robot({
  connections: {
    bean: { adaptor: "bean", beanName: "mybean" }
  }
...
```

## Documentation

We're busy adding documentation to our web site at http://cylonjs.com/ please check there as we continue to work on Cylon.js

Thank you!

## Contributing

For our contribution guidelines, please go to [https://github.com/hybridgroup/cylon/blob/master/CONTRIBUTING.md
](https://github.com/hybridgroup/cylon/blob/master/CONTRIBUTING.md
).

## Release History

None yet...

## License
Copyright (c) 2015 The Hybrid Group. Licensed under the Apache 2.0 license.
