var net = require('net');

function ServerClient(socket) {
  this.socket = socket;
}

ServerClient.prototype.login = function(username) {
  this.username = username;
};

ServerClient.prototype.sendInfo = function(content) {
  var response = {
    timestamp: Date.now(),
    response: 'info',
    content: content
  };
  
  this.socket.write(JSON.stringify(response));
};

ServerClient.prototype.sendError = function(error) {
  var response = {
    timestamp: Date.now(),
    response: 'error',
    content: error
  };

  return this.socket.write(JSON.stringify(response));
};

module.exports = ServerClient;
