var net = require('net');
var ServerClient = require('./server-client');

function Server() {
  this.allowedCommands = ['msg', 'help', 'names', 'login', 'logout'];
  this.authCommands = ['msg', 'names', 'logout'];

  this.clients = [];
  this.history = [];

  this.server = net.createServer(function(socket) {
    var client = new ServerClient(socket);
    this.clients.push(client);
    this.attachListeners(client);
  }.bind(this));
}

Server.prototype.sendMessage = function(message, author) {
  if (!author.username) return; // User not logged in
  
  var payload = {
    timestamp: Date.now(),
    sender: author.username,
    response: 'message',
    content: message
  };
  this.history.push(payload);

  this.clients.forEach(function(client) {
    // Only send to logged in users
    if (client !== author && client.username) {
      client.socket.write(JSON.stringify(payload));
    }
  });
};

Server.prototype.listNames = function(user) {
  var names = this.clients.map(function(client) {
    return client.username;
  });
  
  user.sendInfo(names.join(', '));
};

Server.prototype.listCommands = function(user) {
  var help = 'Allowed commands are: ' + this.allowedCommands.join(', ');
  user.sendInfo(help); 
};

Server.prototype.logout = function(user) {
  this.clients.splice(this.clients.indexOf(user), 1);
  user.socket.end();
};

Server.prototype.handleRequest = function(client, payload) {
  var command = payload.request;
  if (this.authCommands.indexOf(command) > -1 && !client.username) {
    return client.sendError('Not authenticated'); 
  }

  switch (command) {
    case 'msg':
      this.sendMessage(payload.content, client);
      break;
    case 'login':
      client.login(payload.content, this.history);
      break;
    case 'logout':
      this.logout(client);
      break;
    case 'names':
      this.listNames(client);
      break;
    case 'help':
      this.listCommands(client);
      break;
    default:
      this.listCommands(client);
  }
};

Server.prototype.attachListeners = function(client) {
  client.socket.on('data', function(data) {
    try {
      data = JSON.parse(data); 
    } catch (e) {
      return client.sendError('Couldn\'t parse JSON: ' + data);
    }

    this.handleRequest(client, data); 
  }.bind(this));

  client.socket.on('end', function() {
    this.logout(client);
  }.bind(this));
};

module.exports = Server;
