const WebSocket = require('ws');

class wsSocket {
	constructor(portValue) {
		const wss = new WebSocket.Server({ port: portValue });
		wss.on('connection', ws => {
			this.socket = ws;
			ws.on('message', message => {
				console.log(`Received message => ${message}`);
			});
			ws.send('WebSocket created, connected and working');
		});
	}
}

export default wsSocket;
