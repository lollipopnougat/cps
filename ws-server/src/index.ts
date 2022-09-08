import * as mqtt from 'mqtt';
import WebSocket from 'ws';
import ColorConsole from './ColorConsole';
import GPSConvert from './GPS/GPSConvert';
import { DeviceDataFilter } from './model/DataHelper';
import { PtcType } from './model/enums';
import Guidance from './model/Guidance';

/** ws端口 */
const port = 3001;
/** 控制台自动输出间隔 */
const intervalms = 10 * 1000;
const MQTTPUBURI = '118.195.244.224';
// const MQTTPUBURI = '127.0.0.1';

/** 发包间隔ms */
const updateIntervalms = 1 * 1000;

let cid = 0;
let sendCount = 0;
let mqttSendCount = 0;
let packetRecvCount = 0;
let taxiTransCount = 0;

/** ws连接池 */
const conPool: Map<string, WebSocket> = new Map();



// const sensor_sn = '00000359';//'00000359';
// const sensor_sn = '00000304';//'00000359';

/** 设备集 */
const ss = new Set(); // 2503
ss.add('00000304'); // 对应2504 00000305
ss.add('00000489');
ss.add('00000414');
ss.add('00000120');
ss.add('00000370');
ss.add('00000403');
ss.add('00000262');
// const slight_sn = '00000360';
const filter = new DeviceDataFilter(e => ss.has(e.device_sn));

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

/** mqtt发布 */
const publisher = mqtt.connect({
    host: MQTTPUBURI,
    // port: 1883
    // host: '127.0.0.1',
    port: 1883
});

publisher.on('connect', () => {
    ColorConsole.log(`[server] {}publisher connected to mqtt server{}`, ColorConsole.MAGENTA);
});


publisher.on('message', (topic: string, msg: Buffer) => {
    taxiTransCount++;
    const datastr = msg.toString('utf8');
    wsend(datastr);
});


/** 连接天安mqtt */
const carClient = mqtt.connect({
    host: '36.137.214.49',
    port: 1883,
    keepalive: 30,
    username: 'ecnu',
    password: 'ecnu'
});

carClient.on('connect', () => {
    ColorConsole.log(`[server] {}client connected to TianAn mqtt server{}`, ColorConsole.MAGENTA);
});

const carDataMap: Map<string, Ptc> = new Map();
const trafficDataMap: Map<string, number> = new Map();

/** 解析天安mqtt数据 */
carClient.on('message', (topic: string, msg: Buffer) => {
    const datastr = msg.toString('utf8');
    const js = JSON.parse(datastr) as DeviceFrame;
    if (js.tag == 2503) {
        const cars = js as Device2503Frame;
        cars.ptcs.forEach(e => {
            e.device_sn = parseInt(cars.device_sn);
            carDataMap.set(e.ptc_id_str, e);
        });
        let count = trafficDataMap.get(cars.device_sn) ?? 0;
        trafficDataMap.set(cars.device_sn, count + cars.ptcs.length);
    } else if (js.tag == 2504) {
        let device = js as Device2504Frame;
        filter.crossingLight = device;
     } //else if (js.tag == 2505) {
    //     let devicedt = js as Device2505Frame;
    //     // publisher.publish('traffic', datastr, { qos: 0, retain: true });
    // }
    
});

setInterval(() => {
    const list: Ptc[] = [];
    carDataMap.forEach((v) => {
        if (v.ptc_type == PtcType.MVehicle) {
            list.push(v)
        }
    });
    trafficDataMap.forEach((v, k) => {
        const dt: TrafficData = {
            time: Date.now(),
            interval: 1,
            deviceId: k,
            carCount: v
        };
        publisher.publish('traffic', JSON.stringify(dt), { qos: 0, retain: true });
    });
    trafficDataMap.clear();
    carDataMap.clear();
    const res = filter.parseCarData(list);
    const dat = JSON.stringify(res);
    wsend(dat);
    publisher.publish('crossing', dat, { qos: 0, retain: true });
    mqttSendCount++;
    
}, updateIntervalms);

carClient.subscribe(['tian_rsu/ecnu/2503', 'tian_rsu/ecnu/2504'], { qos: 0 });
publisher.subscribe(['taxi', 'passenger', 'rc']);

setInterval(() => {
    ColorConsole.log(`[server] server has sent {}${sendCount}{} crossing ws packets.`, ColorConsole.BLUE);
    ColorConsole.log(`[server] server has recv {}${packetRecvCount}{} packets.`, ColorConsole.GREEN);
    ColorConsole.log(`[server] server has sent {}${mqttSendCount}{} mqtt packets.`, ColorConsole.MAGENTA);
    ColorConsole.log(`[server] server has transform {}${taxiTransCount}{} mqtt to ws packets.`, ColorConsole.YELLOW);
    // ColorConsole.log(`[server] server has used {}${Guidance.usingTimes}{} times algorithm.`, ColorConsole.RED);
}, intervalms);
