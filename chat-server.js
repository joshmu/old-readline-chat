var port = Number(process.env.PORT || 5000);
var io = require('socket.io').listen(port, function(){
	console.log('Listening on port:', port);
});

io.on('connection', function(socket){
	//user connected
	console.log('user connected');

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



