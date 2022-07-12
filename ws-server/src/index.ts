import * as mqtt from 'mqtt';
import WebSocket from 'ws';
import ColorConsole from './ColorConsole';
import { DeviceDataFilter } from './model/DataHelper';

const port = 3001;
let cid = 0;
let sendCount = 0;

const conPool: Map<string, WebSocket> = new Map();
// const sensor_sn = '00000359';//'00000359';
const sensor_sn = '00000304';//'00000359';
const ss = new Set();
ss.add('00000304');
ss.add('00000489');
ss.add('00000414');
ss.add('00000120');
ss.add('00000370');
ss.add('00000403');
ss.add('00000262');
const slight_sn = '00000360';
const filter = new DeviceDataFilter(e => ss.has(e.device_sn));
const intervalms = 10 * 1000;

function wsend(msg: string): boolean {
    if (conPool.size == 0) {
        return false;
    }
    sendCount++;
    for (let [_, v] of conPool) {
        v.send(msg);
    }
    return true;
}

const wss = new WebSocket.Server({ port, path: '/ws' });

wss.on('listening', () => {
    ColorConsole.log('[server] {}WebSocket Server is listening.{}', ColorConsole.GREEN);
});

wss.on('connection', (ws) => {
    const uid = cid.toString();
    ColorConsole.log(`[server] {}client [${uid}] has connected.{}`, ColorConsole.GREEN);
    cid++;
    conPool.set(uid, ws);
    ws.on('close', () => {
        conPool.delete(uid);
        ColorConsole.log(`[server] {}[${uid}] is closed{}`, ColorConsole.RED);
    });
});

const client = mqtt.connect({
    host: '36.137.214.49',
    port: 1883,
    keepalive: 30,
    username: 'ecnu',
    password: 'ecnu'
});

client.on('connect', () => {
    ColorConsole.log(`[server] {}connected to mqtt server{}`, ColorConsole.MAGENTA);
});

client.on('message', (topic: string, msg: Buffer) => {
    const datastr = msg.toString('utf8');
    const js = JSON.parse(datastr) as Device2503Frame;
    const res = filter.parseData(js);
    // console.log(js.device_type);
    if (res) {
        wsend(JSON.stringify(res));
    }
});

client.subscribe('tian_rsu/ecnu/2503', { qos: 1 });

setInterval(() => {
    ColorConsole.log(`[server] server has sent {}${sendCount}{} packets.`, ColorConsole.BLUE);
}, intervalms);
