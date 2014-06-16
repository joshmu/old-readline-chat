//http://code.tutsplus.com/tutorials/real-time-chat-with-nodejs-readline-socketio--cms-20953

var readline = require('readline'),
	socketio = require('socket.io-client'),
	util = require('util'),
	color = require('ansi-color').set;

var nick;
var socket = socketio.connect('http://caffeinedreams.herokuapp.com');
var rl = readline.createInterface(process.stdin, process.stdout);

//ASKING USER'S NAME
rl.question('Please enter a nickname: ', function(name){
	nick = name;
	var msg = nick + ' has joined the chat.';
	socket.emit('send', {type:'notice', message: msg});
	rl.prompt(true);
});

function console_out(msg){
	process.stdout.clearLine();
	process.stdout.cursorTo(0);
	console.log(msg);
	rl.prompt(true);
}

//HANDLING INPUT
rl.on('line', function(line){
	if(line[0] === '/' && line.length > 1) {
		var cmd = line.match(/[a-z]+\b/)[0];
		var arg = line.substr(cmd.length+2, line.length);
		chat_command(cmd, arg);
	} else {
		//send chat message
		socket.emit('send', {type:'chat', message: line, nick: nick});
		rl.prompt(true);
	}
});

function chat_command(cmd, arg) {
	switch(cmd) {

		case 'nick':
			var notice = nick + ' changed their name to ' + arg;
			nick = arg;
			socket.emit('send', {type:'notice', message:notice});
			break;

		case 'msg':
			var to = arg.match(/[a-zA-Z]+\b/)[0];
			var msg = arg.substr(to.length, arg.length);
			socket.emit('send', {type: 'tell', message: msg, to: to, from: nick});
			break;

		case 'me':
			var emote = nick + ' ' + arg;
			socket.emit('send', {type: 'emote', message: emote});
			break;

		default:
			console_out("That is not a valid command.");


	}
}

//HANDLING INCOMING MESSAGES
socket.on('message', function(data){
	var lead;

	if(data.type == 'chat' && data.nick != nick) {
		lead = color('<' + data.nick + '> ', 'green');
		console_out(lead + data.message);
	}

	else if (data.type === 'notice') {
		console_out(color(data.message, 'cyan'));
	}

	else if (data.type === 'tell' && data.to === nick) {
		lead = color('[' + data.from + '->' + data.to + ']', 'red');
		console_out(lead + data.message);
	}

	else if (data.type === 'emote') {
		console_out(color(data.message ,'cyan'));
	}

});