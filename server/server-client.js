var net = require('net');

function ServerClient(socket) {
  this.socket = socket;
}

ServerClient.prototype.login = function(username, history) {
  var validUsername = /^[\w]+$/
  if (username.match(validUsername)) {
    this.username = username;
    this.sendHistory(history);
  } else {
    this.sendError('Usernames can only contain numbers and letters from A-Z') 
  }
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

ServerClient.prototype.sendHistory = function(history) {
  var payload = {
    timestamp: Date.now(),
    response: 'history',
    content: history
  };
  
  this.socket.write(JSON.stringify(payload));
};

module.exports = ServerClient;
