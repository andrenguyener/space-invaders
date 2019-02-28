const express = require("express");
const morgan = require("morgan");
const app = express();
const path = require("path");
const http = require("http");
const socketIO = require("socket.io");
// const https = require("https");
const fs = require("fs");
const privateKey = fs.readFileSync("./tls/privkey.pem", "utf8");
const certificate = fs.readFileSync("./tls/fullchain.pem", "utf8");
const credentials = { key: privateKey, cert: certificate };

const addr = "localhost:5000";
const [host, port] = addr.split(":");
const portNum = parseInt(port);

const SpaceStore = require("./models/space-store");
const SpaceHandler = require("./handlers/space");
const Socket = require("./handlers/socket");

(async () => {
	try {
		app.use(morgan("dev"));
		app.use(express.json());

		const httpServer = http.createServer(app);
		const io = socketIO(httpServer);

		// var httpsServer = https.createServer(credentials, app);

		let spaceStore = new SpaceStore();

		app.use(SpaceHandler(spaceStore));
		// app.use(Socket(io));
		Socket(io);

		httpServer.listen(portNum, host, () => {
			console.log(`server is listening at http://${addr}`);
		});
		// httpsServer.listen(portNum, host, () => {
		//     console.log(`server is listening at https://${addr}`);
		// });
	} catch (err) {
		console.warn(err);
	}
})();

// user creates name or random
// user has option to select single player or multiplayer
// if single
// - create an array of objects with each object containing information per level
// if multiplayer
// - create a lobby with first person as host
// - host is able to start game whenever
// - show scores and winner at the end
// - lose when level ends or all player dies
