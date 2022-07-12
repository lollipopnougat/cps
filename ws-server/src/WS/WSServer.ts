import WebSocket from 'ws';

export default class WSServer {
    constructor(port: number) {
        this.port = port;
    }
    
    private port: number = 3000;
    private wss?: WebSocket.Server<WebSocket.WebSocket>;
    private connectionFunction?: (ws?: WebSocket.WebSocket) => void;
    set onConnection(val: (ws?: WebSocket.WebSocket) => void) {
        this.connectionFunction = val;
    }
    
    start() {
        this.wss = new WebSocket.Server({port: this.port});
        this.wss.on('connection', this.connectionFunction!);
    }

    stop() {
        this.wss?.close();
    }
}