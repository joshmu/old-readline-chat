var port = Number(process.env.PORT || 3000);

var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.get('/', function(req, res){
	res.sendfile('index.html');
});

http.listen(port, function(){
	console.log('listening on *:' + port);
});

var Clients = [];

io.on('connection', function(socket){
	//user connected
	console.log('user connected');
	console.log('socket id is:', socket.id);

	//store client information
	socket.emit('socketid', socket.id);
	socket.on('client_info', function(client){
		Clients.push(client);
	});
	socket.on('update_client_info', function(client){
		Clients.forEach(function(c){
			if(c.id === client.id) {
				c.nick = client.nick;
			}
		})
	});

	//broadcast message
	socket.on('send', function(data){
		inspect_message(data);

		console.log('broadcasting message');
		io.sockets.emit('message', data);
	});

	//who is present
	socket.on('whoishere', function(){
		clients_present(socket);
	});

	socket.on('disconnect', function(){
		//user disconnected
		console.log('user disconnected', socket.id);

		update(socket.id);

	});
});

function update(id) {
	if(Clients.length > 1) {
		var leaver = Clients.filter(function(client){
			console.log(client);
			return client.id === id
		})[0];
		console.log('leaver is:', leaver);
		user_leaves(leaver);
		update_clients(id);
	} else {
		console.log('0 clients...');
		Clients = [];
	}
}

function update_clients(id) {
	Clients = Clients.filter(function(client){
		return client.id !== id;
	});
	console.log(Clients.length + ' clients remaining.');
}

function inspect_message(msg) {
	//option to intercept messages before broadcasting
}

function user_leaves(user) {
	msg = {
		type: 'notice',
		message: user.nick + ' has left the chat.'
	};
	io.sockets.emit('message', msg);
}

function clients_present(socket) {
	var chatters = Clients.map(function(client){
		return client.nick;
	});

	var msg = {
		type: 'notice',
		message: chatters.length + ' chatting: '
	};

	msg.message += chatters.slice(0,chatters.length-1).join(', ');
	msg.message += chatters.length > 1 ? " & " : "";
	msg.message += chatters[chatters.length-1] + ".";

	socket.emit('message', msg);

}