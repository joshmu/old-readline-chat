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





io.on('connection', function(socket){
	//user connected
	console.log('user connected');

	var msg = {
		type: 'notice',
		message : 'hello from the server!'
	};

	socket.emit('message', msg);

	//broadcast message
	socket.on('send', function(data){
		console.log('broadcasting message');
		io.sockets.emit('message', data);
	});

	socket.on('disconnect', function(){
		//user disconnected
		console.log('user disconnected');
	});
});



