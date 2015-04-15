"use strict";

var Cylon = require("cylon");
var SerialPort = require('bean-serial').SerialPort;
var Firmata = require('firmata');
var Bean = require('ble-bean');

var Adaptor = module.exports = function Adaptor(opts) {
  Adaptor.__super__.constructor.apply(this, arguments);
  opts = opts || {};
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
  "i2cRead"
];

Adaptor.prototype.connect = function(callback) {
  var self = this;
  Bean.discover(function(bean){
    self.connectedBean = bean;

    // bean.on("disconnect", function(){
    //   process.exit();
    // });

    bean.connectAndSetup(function(){
      //set color to the built in LED so we know we're connected
      self.connectedBean.setColor(new Buffer([255, 255, 0]), function(err){
        console.log('set color', err);
      });

      bean.unGate(function(){
        self.serialPort = new SerialPort(self.connectedBean);

        self.board = new Firmata.Board(self.serialPort, {skipHandshake: true, samplingInterval:60000}, function (err, ok) {
          if (err){
            console.log('could not connect to board----' , err);
          }

          console.log("board loaded", ok);
          callback();
        });
      });
    });
  });
};

Adaptor.prototype.disconnect = function(callback) {
  var self = this;
  if (self.connectedBean) {
    console.log('Turning off led...');
    self.connectedBean.setColor(new Buffer([0x0,0x0,0x0]), function(){});
    //no way to know if succesful but often behind other commands going out, so just wait 2 seconds
    console.log('Disconnecting from Device...');
    setTimeout(self.connectedBean.disconnect.bind(self.connectedBean, callback), 2000);
  } else {
    callback();
  }
};

/**
 * Reads a value from a digital pin
 *
 * @param {Number} pin
 * @param {Function} callback triggered when the value has been read from the
 * pin
 * @return {null}
 * @publish
 */
Adaptor.prototype.digitalRead = function(pin, callback) {
  this.pinMode(pin, "input");

  this.board.digitalRead(pin, function(value) {
    this.respond("digitalRead", callback, null, value, pin);
  }.bind(this));
};

/**
 * Writes a value to a digital pin
 *
 * @param {Number} pin
 * @param {Number} value
 * @return {null}
 * @publish
 */
Adaptor.prototype.digitalWrite = function(pin, value, callback) {
  this.pinMode(pin, "output");
  this.board.digitalWrite(pin, value);
  this.respond("digitalWrite", callback, null, value, pin);
};

/**
 * Reads a value from an analog pin
 *
 * @param {Number} pin
 * @param {Function} callback triggered when the value has been read from the
 * pin
 * @return {null}
 * @publish
 */
Adaptor.prototype.analogRead = function(pin, callback) {
  this.board.analogRead(pin, function(value) {
    this.respond("analogRead", callback, null, value, pin);
  }.bind(this));
};

/**
 * Writes a value to an analog pin
 *
 * @param {Number} pin
 * @param {Number} value
 * @return {null}
 * @publish
 */
Adaptor.prototype.analogWrite = function(pin, value, callback) {
  value = (value).toScale(0, 255);
  this.pinMode(this.board.analogPins[pin], "analog");
  this.board.analogWrite(this.board.analogPins[pin], value);
  this.respond("analogWrite", callback, null, value, pin);
};

/**
 * Writes a PWM value to a pin
 *
 * @param {Number} pin
 * @param {Number} value
 * @return {null}
 * @publish
 */
Adaptor.prototype.pwmWrite = function(pin, value, callback) {
  value = (value).toScale(0, 255);
  this.pinMode(pin, "pwm");
  this.board.analogWrite(pin, value);
  this.respond("pwmWrite", callback, null, value, pin);
};

/**
 * Writes a servo value to a pin
 *
 * @param {Number} pin
 * @param {Number} value
 * @return {null}
 * @publish
 */
Adaptor.prototype.servoWrite = function(pin, value, callback) {
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
 * @param {Function} callback
 * @return {null}
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
 * @param {Function} callback
 * @return {null}
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
