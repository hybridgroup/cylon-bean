"use strict";

var Cylon = require("cylon");
var SerialPort = require("bean-serial").SerialPort;
var Firmata = require("firmata");
var Bean = require("ble-bean");

var Adaptor = module.exports = function Adaptor(opts) {
  Adaptor.__super__.constructor.apply(this, arguments);
  opts = opts || {};
  this.beanName = opts.beanName;
};

var PINS = {
  0: 6, // currently
  1: 9, // unavilable?
  2: 10,
  3: 11,
  4: 12,
  5: 13
};

var PWM_PINS = {
  0: 6, // currently
  1: 9, // unavilable?
  2: 10,
  3: 11
};

var ANALOG_PINS = {
  A0: 4,
  A1: 5,
  0: 4,
  1: 5
};

Cylon.Utils.subclass(Adaptor, Cylon.Adaptor);

Adaptor.prototype.commands = [
  "pinMode",
  "digitalRead",
  "digitalWrite",
  "analogRead",
  "analogWrite",
  "pwmWrite",
  "servoWrite",
  "i2cConfig",
  "i2cWrite",
  "i2cRead",
  "setColor",
  "getAcceleration",
  "getTemperature"
];

Adaptor.prototype.connect = function(callback) {
  var self = this;

  Bean.discover(function(bean) {
    self.connectedBean = bean;

    if (self.beanName &&
        self.beanName !== bean._peripheral.advertisement.localName) {
      return;
    }

    bean.on("accell", function(x, y, z, valid) {
      self.emit("accel", x, y, z, valid);
    });

    bean.on("temp", function(temp, valid) {
      self.emit("temp", temp, valid);
    });

    bean.connectAndSetup(function() {
      // set color to the built in LED so we know we're connected
      self.setLed(255, 255, 0);

      bean.unGate(function() {
        self.serialPort = new SerialPort(self.connectedBean);

        self.board = new Firmata.Board(self.serialPort,
           {skipHandshake: true, samplingInterval: 250},
           function(err, ok) {
             if (err) {
               Cylon.Logger.debug("Error connect to virtual serial port", err);
             }
             Cylon.Logger.debug("Connected to virtual serial port", ok);
             callback();
           }
         );
      });
    });
  });
};

Adaptor.prototype.disconnect = function(callback) {
  var bean = this.connectedBean;
  if (bean) {
    bean.setColor(new Buffer([0x0, 0x0, 0x0]), function() {});
    setTimeout(bean.disconnect.bind(bean, callback), 2000);
  } else {
    callback();
  }
};

/**
 * Reads a value from a digital pin
 *
 * @param {Number} pinNum the number of the pin to use
 * @param {Function} callback triggered when the value has been read from the
 * pin
 * @return {void}
 * @publish
 */
Adaptor.prototype.digitalRead = function(pinNum, callback) {
  var pin;
  pin = this._translatePin(pinNum);
  this.pinMode(pin, "input");

  this.board.digitalRead(pin, function(value) {
    this.respond("digitalRead", callback, null, value, pin);
  }.bind(this));
};

/**
 * Writes a value to a digital pin
 *
 * @param {Number} pinNum the number of the pin to use
 * @param {Number} value the value to write to the pin
 * @param {Function} callback function to be invoked when done
 * @return {void}
 * @publish
 */
Adaptor.prototype.digitalWrite = function(pinNum, value, callback) {
  var pin;
  pin = this._translatePin(pinNum);
  this.pinMode(pin, "output");
  this.board.digitalWrite(pin, value);
  this.respond("digitalWrite", callback, null, value, pin);
};

/**
 * Reads a value from an analog pin
 *
 * @param {Number} pinNum the number of the pin to use
 * @param {Function} callback triggered when the value has been read from the
 * pin
 * @return {void}
 * @publish
 */
Adaptor.prototype.analogRead = function(pinNum, callback) {
  var pin;
  pin = this._translateAnalogPin(pinNum);
  this.board.analogRead(pin, function(value) {
    this.respond("analogRead", callback, null, value, pin);
  }.bind(this));
};

/**
 * Writes a value to an analog pin
 *
 * @param {Number} pinNum the number of the pin to use
 * @param {Number} value the value to write to the pin
 * @param {Function} callback function to be invoked when done
 * @return {void}
 * @publish
 */
Adaptor.prototype.analogWrite = function(pinNum, value, callback) {
  var pin;
  pin = this._translateAnalogPin(pinNum);
  value = (value).toScale(0, 255);
  this.pinMode(this.board.analogPins[pin], "analog");
  this.board.analogWrite(this.board.analogPins[pin], value);
  this.respond("analogWrite", callback, null, value, pin);
};

/**
 * Writes a PWM value to a pin
 *
 * @param {Number} pinNum the number of the pin to use
 * @param {Number} value the value to write to the pin
 * @param {Function} callback function to be invoked when done
 * @return {void}
 * @publish
 */
Adaptor.prototype.pwmWrite = function(pinNum, value, callback) {
  var pin;
  pin = this._translatePwmPin(pinNum);
  value = (value).toScale(0, 255);
  this.pinMode(pin, "pwm");
  this.board.analogWrite(pin, value);
  this.respond("pwmWrite", callback, null, value, pin);
};

/**
 * Writes a servo value to a pin
 *
 * @param {Number} pinNum the number of the pin to use
 * @param {Number} value the value to write to the pin
 * @param {Function} callback function to be invoked when done
 * @return {void}
 * @publish
 */
Adaptor.prototype.servoWrite = function(pinNum, value, callback) {
  var pin;
  pin = this._translatePwmPin(pinNum);
  value = (value).toScale(0, 180);
  this.pinMode(pin, "servo");
  this.board.servoWrite(pin, value);
  this.respond("servoWrite", callback, null, value, pin);
};

/**
 * Writes an I2C value to the board.
 *
 * @param {Number} address I2C address to write to
 * @param {Number} cmd I2C command to write
 * @param {Array} buff buffered data to write
 * @param {Function} callback function to be invoked when done
 * @return {void}
 * @publish
 */
Adaptor.prototype.i2cWrite = function(address, cmd, buff, callback) {
  if (!this.i2cReady) { this.i2cConfig(2000); }
  cmd = (Array.isArray(cmd)) ? cmd : [cmd];
  this.board.sendI2CWriteRequest(address, cmd.concat(buff));
  this.respond("i2cWrite", callback);
};

/**
 * Reads an I2C value from the board.
 *
 * @param {Number} address I2C address to write to
 * @param {Number} cmd I2C command to write
 * @param {Number} length amount of data to read
 * @param {Function} callback function to be invoked when done
 * @return {void}
 * @publish
 */
Adaptor.prototype.i2cRead = function(address, cmd, length, callback) {
  if (!this.i2cReady) {
    this.i2cConfig(2000);
  }

  // TODO: decouple read and write operations here...
  if (cmd) {
    cmd = (Array.isArray(cmd)) ? cmd : [cmd];
    this.board.sendI2CWriteRequest(address, cmd);
  }

  this.board.sendI2CReadRequest(address, length, function(data) {
    var err = null;

    if (data.name === "Error") {
      err = data;
      data = null;
    }

    this.respond("i2cRead", callback, err, data);
  }.bind(this));
};

Adaptor.prototype.pinMode = function(pin, mode) {
  this.board.pinMode(pin, this._convertPinMode(mode));
};

Adaptor.prototype.i2cConfig = function(delay) {
  this.board.sendI2CConfig(delay);
  this.i2cReady = true;
};

Adaptor.prototype._convertPinMode = function(mode) {
  return this.board.MODES[mode.toUpperCase()] || this.board.MODES.INPUT;
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
Adaptor.prototype.setLed = function(r, g, b) {
  this.connectedBean.setColor(new Buffer([r, g, b]), function(err) {
    if (err) {
      Cylon.Logger.debug("setColor error", err);
    }
  });
};

/**
 * Reads the built-in accelerometer once
 *
 * @return {void}
 * @publish
 */
Adaptor.prototype.getAcceleration = function() {
  this.connectedBean.requestAccell();
};

/**
 * Reads the built-in thermometer once
 *
 * @return {void}
 * @publish
 */
Adaptor.prototype.getTemperature = function() {
  this.connectedBean.requestTemp();
};

Adaptor.prototype._translatePin = function(pinNum) {
  return PINS[pinNum.toString()];
};

Adaptor.prototype._translatePwmPin = function(pinNum) {
  return PWM_PINS[pinNum.toString()];
};

Adaptor.prototype._translateAnalogPin = function(pinNum) {
  return ANALOG_PINS[pinNum.toString()];
};
