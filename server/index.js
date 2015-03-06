var Server = require('./server');

var server = new Server();
server.server.listen(3000, function() {
  console.log('Listening.');
});
