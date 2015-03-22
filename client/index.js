var moment = require('moment');
var readline = require('readline');
var chalk = require('chalk');
var Client = require('./client');
var rl = readline.createInterface({ input: process.stdin, output: process.stdout });

var host = process.env.HOST || 'localhost';
var port = process.env.PORT || 3000;

var client = new Client(host, port);

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
  });
});

rl.on('line', function(line) {
  line = line.trim();
  if (line.charAt(0) === '/') {
    var command = line.slice(1);
    client.sendCommand(command);
  } else {
    client.sendMessage(line);
  }

  rl.prompt();
});

function printMessage(message, author, timestamp) {
  var time = chalk.yellow(moment(timestamp).format('HH:mm') + ' ');
  var user = chalk.green('[' + author + '] ');
  output(time + user + message);
}

client.on('message', printMessage);

client.on('loggedIn', function(history) {
  rl.setPrompt(chalk.cyan('[' + client.username + '] '));
  history.forEach(function(message) {
    printMessage(message.content, message.sender, message.timestamp);
  });

  rl.prompt(); 
});

client.on('info', function(info) {
  var message = chalk.magenta.bold(info);
  output(message);
});

client.on('error', function(error) {
  var message = chalk.red.bold(error);
  output(message);
  process.exit(1);
});
