import { DataType, PtcType, GPSType, GLightColor, LightGroupColor } from './enums';
import GPSConvert from '../GPS/GPSConvert';
import Guidance from './Guidance';
import VincentyDisCal from '../GPS/Distance';

type AllDeviceFrame = Device2503Frame | Device2504Frame;
type Predicate = (data: AllDeviceFrame) => boolean;

class Random {
    static nextInt(min = 0, max = 1): number {
        const range = max - min + 1;
        const ranValue = min + Math.floor(Math.random() * range);
        return ranValue;
    }
    /**
     * 从数组中随机选择元素
     * @param array - 数组
     * @returns 数组中随机元素
     */
    static choice<T>(array: T[]): T {
        const max = array.length - 1;
        return array[Random.nextInt(0, max)];
    }
}

/** 数据包过滤 */
export class DeviceDataFilter {

    /**
     * 创建数据包过滤对象
     * @param pre - 用于过滤的谓词表达式
     * @param deviceType - 设备类型(可选)
     */
    constructor(pre: Predicate, deviceType: DataType = DataType.Device2503) {
        this.predicate = pre;
        this.deviceType = deviceType;
    }
    private predicate: Predicate;
    private deviceType: DataType;
    private static readonly suggests: string[] = ['Stop', 'PASS', 'Crusing'];

    /** 路口位置map */
    private crossingLights: Map<string, Device2504Frame> = new Map();
    private crossingLightMap: Map<string, string> = new Map();
    public set crossingLight(val: Device2504Frame) {
        if (this.crossingLights.has(val.device_sn)) {
            let d = this.crossingLights.get(val.device_sn) as Device2504Frame;
            d.light_info_list = val.light_info_list;
            d.light_info_num = val.light_info_num;
        }
        else {
            this.crossingLights.set(val.device_sn, val);
            this.crossingLightMap.set(val.local_id.toString(), val.device_sn);
        }
    }

    parseCarData(dataList: Ptc[]): CrossingData | null {
        if (dataList.length > 0) {
            const wsdata: CrossingData = {
                type: 'crossing',
                timeStamp: Date.now(),
                // did: dat.device_sn,
                vehicles: []
            };
            for (let i of dataList) {
                const latlng = GPSConvert.gcj02ToWGS84(i.lat, i.lon);
                const deviceId = this.crossingLightMap.get(i.vehicle.cross_name);
                let device: Device2504Frame | undefined;
                if (deviceId) {
                    device = this.crossingLights.get(deviceId);
                }
                let dis = 20;
                let lightColor = GLightColor.RED;
                let rt: GuidanceRT | undefined;
                if (device) {
                    dis = VincentyDisCal.getDistance(device.lat, device.lon, latlng.lat, latlng.lng);
                    switch (device.light_info_list[0].group_list[0].g_color) {
                        case LightGroupColor.FlashingGreen:
                        case LightGroupColor.Green:
                            lightColor = GLightColor.GREEN; break;
                        case LightGroupColor.FlashingYellow:
                        case LightGroupColor.Yellow:
                            lightColor = GLightColor.YELLOW; break;
                        case LightGroupColor.FlashingRed:
                        case LightGroupColor.Red:
                            lightColor = GLightColor.RED; break;
                    }
                    rt = Guidance.cal(device.light_info_list[0].group_list[0].g_time, lightColor, dis, i.spd * 3.6);
                }
                wsdata.vehicles.push({
                    vid: i.ptc_id_str,
                    lat: latlng.lat,
                    lon: latlng.lng,
                    speed: i.spd,
                    suggest: rt ? rt.type : Random.choice(DeviceDataFilter.suggests),
                    gpsType: GPSType.WGS84
                });
            }
            //dat.ptcs = tmp;
            return wsdata;
        }
        return null;
    }
    /**
     * 检测当前包是否满足筛选条件，满足则生成用于前端的数据，否则返回null
     * @param data - 数据包
     * @returns 用于前端的数据或null
     */
    parseDeviceData(data: DeviceFrame): CrossingData | null {
        if (this.deviceType == DataType.Device2503) {
            const dat = data as Device2503Frame;
            if (this.predicate(dat)) {
                const tmp: Ptc[] = [];
                for (let i of dat.ptcs) {
                    if (i.ptc_type == PtcType.MVehicle) {
                        tmp.push(i);
                    }
                }
                if (tmp.length > 0) {
                    const wsdata: CrossingData = {
                        type: 'crossing',
                        timeStamp: dat.time,
                        // did: dat.device_sn,
                        vehicles: []
                    };
                    for (let i of tmp) {
                        const latlng = GPSConvert.gcj02ToWGS84(i.lat, i.lon);
                        const deviceId = this.crossingLightMap.get(i.vehicle.cross_name);
                        let device: Device2504Frame | undefined;
                        if (deviceId) {
                            device = this.crossingLights.get(deviceId);
                        }
                        let dis = 20;
                        let lightColor = GLightColor.RED;
                        let rt: GuidanceRT | undefined;
                        if (device) {
                            dis = VincentyDisCal.getDistance(device.lat, device.lon, latlng.lat, latlng.lng);
                            switch (device.light_info_list[0].group_list[0].g_color) {
                                case LightGroupColor.FlashingGreen:
                                case LightGroupColor.Green:
                                    lightColor = GLightColor.GREEN; break;
                                case LightGroupColor.FlashingYellow:
                                case LightGroupColor.Yellow:
                                    lightColor = GLightColor.YELLOW; break;
                                case LightGroupColor.FlashingRed:
                                case LightGroupColor.Red:
                                    lightColor = GLightColor.RED; break;
                            }
                            rt = Guidance.cal(device.light_info_list[0].group_list[0].g_time, lightColor, dis, i.spd * 3.6);
                        }
                        wsdata.vehicles.push({
                            vid: i.ptc_id_str,
                            lat: latlng.lat,
                            lon: latlng.lng,
                            speed: i.spd,
                            suggest: rt ? rt.type : Random.choice(DeviceDataFilter.suggests),
                            gpsType: GPSType.WGS84
                        });
                    }
                    //dat.ptcs = tmp;
                    return wsdata;
                }
            }
        }
        return null;
    }


}