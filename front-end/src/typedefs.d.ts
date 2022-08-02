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
    GPSType,
    TaxiStatus
} from './model/enums';

declare global {

    /** 经纬度对象 */
    declare interface LatLng {
        lat: number;
        lng: number;
    }

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
        /** 目标朝向，和正北方向夹角，单位度 */
        hea: number; 
        /** 速度，单位m/s */
        speed: number;
        /** 建议 */
        suggest: string;
        /** GPS类型 */
        gpsType: GPSType;
    }

    /** 与后端的 WebSocket 接口数据结构 */
    declare interface WSData {
        /** 类型 */
        type: string;
        /** 时间戳 */
        timeStamp: number;
    }

    /** 与后端的 WebSocket 接口 路口数据结构 */
    declare interface CrossingData extends WSData {
        type: 'crossing',
        /** 车辆列表 */
        vehicles: VehicleStruct[];
    }

    /** 出租车详细数据 */
    declare interface TaxiStruct {
        /** 车辆唯一标识 */
        tid: string;
        /** 纬度 */
        lat: number;
        /** 经度 */
        lon: number;
        /** 速度，单位m/s */
        speed: number;
        /** 建议 */
        suggest: string;
        /** 状态 */
        state: TaxiStatus;
        /** 过路口 */
        isCrossing: boolean;
    }

    /** 与后端的 WebSocket 接口 网约车数据结构 */
    declare interface TaxiData extends WSData {
        type: 'taxi',
        /** 车辆列表 */
        taxis: TaxiStruct[];
    }

    /** 真车详细数据 */
    declare interface RealCarStruct {
        /** 车辆唯一标识 */
        rid: string;
        /** 纬度 */
        lat: number;
        /** 经度 */
        lon: number;
        /** 速度 */
        speed: number;
        /** 时间戳 */
        timeStamp: number;
        /** 建议 */
        suggest: string;
    }

    /** 与后端的 WebSocket 接口 真车数据结构 */
    declare interface RCData extends WSData {
        type: 'rc',
        /** 行人列表 */
        cars: RealCarStruct[];
    }

    /** 行人详细数据 */
    declare interface PersonStruct {
        /** 行人一标识 */
        pid: string;
        /** 纬度 */
        lat: number;
        /** 经度 */
        lon: number;
        /** 状态 */
        state: PersonStatus;
        /** 假设已叫到出租车的车辆ID */
        taxi_id: string;
    }

    /** 与后端的 WebSocket 接口 行人车数据结构 */
    declare interface PassengerData extends WSData {
        type: 'passenger',
        /** 行人列表 */
        passengers: PersonStruct[];
    }

}