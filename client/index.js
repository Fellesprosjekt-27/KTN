var readline = require('readline');
var Client = require('./client');
var rl = readline.createInterface(process.stdin, process.stdout);

var client = new Client();

function output(message) {
  process.stdout.clearLine();
  process.stdout.cursorTo(0);
  console.log(message);
  rl.prompt(true);
}

client.on('connected', function() {
  console.log('connected');;
  rl.question('What\'s your name? ', function(username) {
    client.login(username);
    rl.prompt(); 
  });
});

rl.on('line', function(line) {
  client.sendMessage(line.trim());
  rl.prompt(true);
});

client.on('message', function(message, author) {
  output(author + ': ' + message);
});

client.on('loggedIn', function(history) {
  console.log('got hist', history);
});

