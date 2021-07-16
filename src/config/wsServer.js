import WebSocket from 'ws';

export default async expressServer => {
	const websocketServer = new WebSocket.Server({
		noServer: true,
		path: '/websockets'
	});

	expressServer.on('upgrade', (request, socket, head) => {
		websocketServer.handleUpgrade(request, socket, head, websocket => {
			websocketServer.emit('connection', websocket, request);
		});
	});

	return websocketServer;
};
