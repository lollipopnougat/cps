import {
    PtcType,
    CarType,
    DeviceType,
    DeviceStatus,
    LightGroupColor,
    LightGroupType,
    LightInfo,
    PlanType,
    EnterPos,
    GPSType
} from './model/enums';

declare global {
    /** 车辆 */
    declare interface Vehicle {
        /** 车牌 */
        plate_num?: string;
        /** 车宽，单位米 */
        width: number;
        /** 车长，单位米 */
        length: number;
        /** 车高，单位米 */
        height?: number;
        /** 车身颜色 */
        color?: string;
        /** 车辆类型 */
        car_type?: CarType;
        /** 车辆行驶的角度，与正北方向夹角，正东是90° */
        angle?: number;
        /** 车辆速度，单位km/h */
        speed?: number;
        /** 进口车道编号 */
        enter_lane?: number;
        /** 出口车道编号 */
        export_lane?: number;
        /** 车辆匹配车道编号 */
        lane?: number;
        /** 车辆距离停止线距离 */
        to_stop?: number;
        /** 路口编号 */
        cross_name: string;
    }

    /** 交通参与者 */
    declare interface Ptc {
        /** 目标临时ID */
        ptc_id: number;
        /** 目标唯一ID */
        ptc_id_str: string;
        /** 交通参与者类型 */
        ptc_type: PtcType;
        /** 目标纬度 */
        lat: number;
        /** 目标经度 */
        lon: number;
        /** 目标海拔，单位米 */
        ele?: number;
        /** 目标朝向，和正北方向夹角，单位度 */
        hea: number;
        /** 目标速度，单位m/s */
        spd: number;
        /** 车辆信息 */
        vehicle: Vehicle;
    }

    /** 设备数据包公共部分 */
    declare interface DeviceFrame {
        /** 接口号 */
        tag: number;
        /** 时间戳，毫秒级 */
        time: number;
        /** 设备类型 */
        device_type: DeviceType;
        /** 设备序列号 */
        device_sn: string;
    }

    /** 交通参与者信息上报格式 */
    declare interface Device2503Frame extends DeviceFrame {
        ptcs: Ptc[];
    }

    /** WebSocket 接口中的车辆对象结构 */
    declare interface VehicleStruct {
        /** 车辆唯一标识 */
        vid: string;
        /** 纬度 */
        lat: number;
        /** 经度 */
        lon: number;
        /** 速度，单位m/s */
        speed: number;
        /** 建议 */
        suggest: string;
        /** GPS类型 */
        gpsType: GPSType;
    }

    /** 与后端的 WebSocket 接口数据结构 */
    declare interface WSData {
        /** 时间戳 */
        time: number;
        /** 设备序列号 */
        did: string;
        /** 车辆列表 */
        vehicles: VehicleStruct[];
    }

    /** 经纬度对象 */
    declare interface LatLng {
        lat: number;
        lng: number;
    }

}