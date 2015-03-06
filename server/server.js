var net = require('net');

function ServerClient(socket) {
  this.socket = socket;
}

ServerClient.prototype.login = function(username) {
  console.log('logged in', username);
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

function Server() {
  this.allowedCommands = ['msg', 'help', 'names', 'login', 'logout'];
  this.clients = [];
  this.history = [];

  this.server = net.createServer(function(socket) {
    var client = new ServerClient(socket);
    this.clients.push(client);
    this.attachListeners(client);
  }.bind(this));
}

Server.prototype.sendMessage = function(message, author) {
  console.log('author', author.username);
  if (!author.username) return; // User not logged in

  this.clients.forEach(function(client) {
    // Only send to logged in users
    if (client !== author && client.username) {
      var payload = {
        timestamp: Date.now(),
        sender: author.username,
        response: 'message',
        content: message
      };
      
      this.history.push(payload);
      console.log('writing', payload);
      client.socket.write(JSON.stringify(payload));
    }
  }.bind(this));
};

Server.prototype.listNames = function(user) {
  var names = this.clients.map(function(client) {
    return client.username;
  });
  
  client.sendInfo(content);
};

Server.prototype.listCommands = function(user) {
  var help = 'Allowed commands are: ' + this.allowedCommands.join(', ');
  user.sendInfo(help); 
};

Server.prototype.logout = function(user) {
  this.clients.splice(this.clients.indexOf(user), 1);
};

Server.prototype.handleRequest = function(client, payload) {
  console.log('hei', payload);
  switch (payload.request) {
    case 'msg':
      this.sendMessage(payload.content, client);
      break;
    case 'login':
      client.login(payload.content);
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
