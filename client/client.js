var EventEmitter = require('events').EventEmitter;
var net = require('net');
var util = require('util');

function Client() {
  this.socket = net.connect({ port: 3000, encoding: 'utf8' }, function() {
    this.attachListeners();
    this.emit('connected');
  }.bind(this));
}
util.inherits(Client, EventEmitter);

Client.prototype.sendMessage = function(message) {
  var payload = {
    request: 'msg',
    content: message
  };

  this.socket.write(JSON.stringify(payload));
};

Client.prototype.handlePayload = function(payload) {
  switch (payload.response) {
    case 'history':
      this.emit('loggedIn', payload.content);
      break;
    case 'error':
      this.emit('error', payload.content);
      break;
    case 'message':
      this.emit('message', payload.content, payload.sender, payload.timestamp);
      break;
    case 'info':
      this.emit('info', payload.content);
      break;
  }
};

Client.prototype.attachListeners = function() {
  this.socket.on('data', function(data) {
    var payload = JSON.parse(data);
    this.handlePayload(payload);
  }.bind(this));

  this.socket.on('end', function() {
    console.log('disconnected');
    this.emit('disconnect');
  }.bind(this));
};

Client.prototype.login = function(username) {
  this.username = username;

  var request = {
    request: 'login',
    content: username 
  };

  this.socket.write(JSON.stringify(request));
};

module.exports = Client;
