import './style.css';
import './leaflet.css';
// import { GPSType } from './model/enums';
import LeafletMap from './map/LeafletMap';
import GPSConvert from './gps/GPSConvert';



/** 创建地图 */
const map = new LeafletMap('map');
const host = '118.195.244.224';

let filteCrossing = false;
let filteTaxi = false;
let filteRc = false;
// const port = 1883;
const port = 3001;
// const host = '127.0.0.1';
// const port = 3001;
//let carList: VehicleStruct[] = [];
// 中心位置
const cc: LatLng = {
  lat: 31.58459362995765,
  lng: 120.4529333734722
};



map.setView(GPSConvert.gcj02ToWGS84(cc), 16);
//map.setView({ lat: 31.586526986701458, lng: 120.42771346674031 }, 16);
// let url = 'ws://10.68.2.116:9002/cps/car/ws/112';
// let url = 'ws://localhost:3001/ws';
const url = `ws://${host}:${port}/ws`;
let ws = new WebSocket(url);
//let mqtts = mqtt.connect(url);
//let changed = false;


const fun = (msg: MessageEvent<string>) => {
  if (msg.data[0] == 'c') {
    return;
  }
  const data = JSON.parse(msg.data) as CrossingData | TaxiData | PassengerData | RCData;
  //carList = carList.concat(data.vehicles);
  if (data.type == 'crossing') {
    if (filteCrossing) {
      map.removeCars();
      return;
    }
    map.setCars(data.vehicles);
  }
  else if (data.type == 'taxi') {
    if (filteTaxi) {
      map.removeTaxis();
      map.removePersons();
      return;
    }
    map.setTaxis(data.taxis);
  }
  else if (data.type == 'passenger') {
    if (filteTaxi) {
      map.removeTaxis();
      map.removePersons();
      return;
    }
    map.setPersons(data.passengers);
  }
  else if (data.type == 'rc') {
    if (filteRc) {
      map.removeRcs();
      return;
    }
    map.setRcs(data.cars);
  }
};
// (topic: string, payload: Buffer) => {
//   let data: CrossingData | TaxiData | PassengerData;
//   switch (topic) {
//     case 'crossing':
//       data = JSON.parse(payload.toString()) as CrossingData;
//       map.setCars(data.vehicles);
//       break;
//     case 'taxi':
//       data = JSON.parse(payload.toString()) as TaxiData;
//       map.setTaxis(data.taxis);
//       break;
//     case 'passenger':
//       data = JSON.parse(payload.toString()) as PassengerData;
//       map.setPersons(data.passengers);
//       break;
//   }
// };

// setInterval(() => {
//   map.setCars(carList);
//   carList.splice(0, carList.length);
// }, 1000);

// setTimeout(() => {
//   clearInterval(handle);
//   console.log(map.vehicle.size);
//   ws.close();
// }, 5000);

const closeFun = () => {
  const res = confirm('与服务器断开连接, 是否重连?');
  if (res) {
    ws = new WebSocket(url); 
    ws.onmessage = fun;
    ws.onclose = closeFun;
  }
}

//mqtts.on('message', fun);
//mqtts.on('disconnect', closeFun);

ws.onmessage = fun;
ws.onclose = closeFun;
// map.setCars([{
//   vid: '123',
//   lat: cc.lat,
//   lon: cc.lng,
//   speed: 2,
//   suggestSpeed: 1,
//   gpsType: GPSType.WGS84
// }]);

// setTimeout(() => {
//   const latlng = GPSConvert.gcj02ToWSG84({ lat: 31.58479668, lng: 120.43121365 })
//   map.setCars([{
//     vid: '123',
//     lat: latlng.lat,
//     lon: latlng.lng,
//     speed: 7,
//     suggestSpeed: 5,
//     gpsType: GPSType.WSG84
//   }]);
// }, 5000);

window.onload = () => {
  const btn = document.getElementById('btn') as HTMLButtonElement;
  const btn_c = document.getElementById('btn_c') as HTMLButtonElement;
  const btn_t = document.getElementById('btn_t') as HTMLButtonElement;
  const btn_r = document.getElementById('btn_r') as HTMLButtonElement;
  btn.onclick = () => {
    if (map.tooltipStatus) {
      map.tooltipStatus = false;
      btn.className = '';
      btn.innerText = '显示tip信息';
    }
    else {
      map.tooltipStatus = true;
      btn.className = 'on';
      btn.innerText = '关闭tip信息';
    }
  };

  btn_c.onclick = () => {
    if (filteCrossing) {
      filteCrossing = false;
      btn_c.className = '';
      btn_c.innerText = '关闭路口信息';
    }
    else {
      filteCrossing = true;
      btn_c.className = 'filter';
      btn_c.innerText = '打开路口信息';
    }
  };

  btn_t.onclick = () => {
    if (filteTaxi) {
      filteTaxi = false;
      btn_t.className = '';
      btn_t.innerText = '关闭网约车信息';
    }
    else {
      filteTaxi = true;
      btn_t.className = 'filter';
      btn_t.innerText = '打开网约车信息';
    }
  };

  btn_r.onclick = () => {
    if (filteRc) {
      filteRc = false;
      btn_r.className = '';
      btn_r.innerText = '关闭真车信息';
    } else {
      filteRc = true;
      btn_r.className = 'filter';
      btn_r.innerText = '打开真车信息';
    }
  };
};

