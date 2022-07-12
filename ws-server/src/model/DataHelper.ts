import { DataType, PtcType, GPSType } from './enums';
import GPSConvert from '../GPS/GPSConvert';

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
    private static readonly suggests: string[] = ['Stop', 'Fast', 'Slow'];

    /**
     * 检测当前包是否满足筛选条件，满足则生成用于前端的数据，否则返回null
     * @param data - 数据包
     * @returns 用于前端的数据或null
     */
    parseData(data: DeviceFrame): WSData | null {
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
                    const wsdata: WSData = {
                        time: dat.time,
                        did: dat.device_sn,
                        vehicles: []
                    };
                    for (let i of tmp) {
                        const latlng = GPSConvert.gcj02ToWGS84(i.lat, i.lon);
                        wsdata.vehicles.push({
                            vid: i.ptc_id_str,
                            lat: latlng.lat,
                            lon: latlng.lng,
                            speed: i.spd,
                            suggest: Random.choice(DeviceDataFilter.suggests),
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