const Socket = io => {
	const players = {};

	io.on("connection", socket => {
		socket.on("new player", () => {
			players[socket.id] = {
				x: 300,
				y: 300
			};
			console.log(`Players = ${JSON.stringify(players, null, 4)}`);
		});

		socket.on("movement", data => {
			const player = players[socket.id] || {};
			if (data.left) {
				player.x -= 5;
			}
			if (data.up) {
				player.y -= 5;
			}
			if (data.right) {
				player.x += 5;
			}
			if (data.down) {
				player.y += 5;
			}
			console.log(`Movement = ${JSON.stringify(data, null, 4)}`);
		});

		socket.on("disconnect", socket => {
			// remove disconnected player
			delete players[socket.id];
			console.log(players);
		});

		setInterval(() => {
			io.sockets.emit("state", players);
		}, 1000 / 60);
	});
};

module.exports = Socket;
