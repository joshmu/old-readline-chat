var io = require('socket.io').listen(3636);

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



