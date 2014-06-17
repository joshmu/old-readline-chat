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
	console.log('Clients online are:', Clients);

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

		var leaver = Clients.filter(function(client){
			console.log(client);
			return client.id === socket.id
		})[0];
		console.log('leaver is:', leaver);
		user_leaves(leaver);
		update_clients(socket.id);

	});
});

function update_clients(id) {
	Clients = Clients.map(function(client){
		return client.id !== id;
	});
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
	var msg = {
		type: 'notice',
		message : " : "
	};

	Clients.forEach(function(client){
		msg.message += client.nick + ' : '
	});

	socket.emit('message', msg);

}