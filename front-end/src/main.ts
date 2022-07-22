import './style.css';
import './leaflet.css';
// import { GPSType } from './model/enums';
import LeafletMap from './map/LeafletMap';
import GPSConvert from './gps/GPSConvert';


/** 创建地图 */
const map = new LeafletMap('map');
const host = '118.195.244.224';
const port = 1883;
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

//let changed = false;


const fun = (msg: MessageEvent<string>) => {
  if (msg.data[0] == 'c') {
    return;
  }
  const data = JSON.parse(msg.data) as CrossingData | TaxiData | PassengerData;
  //carList = carList.concat(data.vehicles);
  if (data.type == 'crossing') {
    map.setCars(data.vehicles);
  }
  else if (data.type == 'taxi') {
    map.setTaxis(data.taxis);
  }
  else if (data.type == 'passenger') {
    map.setPersons(data.passengers);
  }
};

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
  btn.onclick = () => {
    if (map.tooltipStatus) {
      map.tooltipStatus = false;
      btn.className = '';
      btn.innerText = '显示信息';
    }
    else {
      map.tooltipStatus = true;
      btn.className = 'on';
      btn.innerText = '关闭信息';
    }
  };
};

