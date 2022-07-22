/** 交通参与者类型 */
export enum PtcType {
    Unknown = 0,
    MVehicle,
    NMVehicle,
    Passenger,
    RSU
}

/** 车辆类型 */
export enum CarType {
    Unknown = 0,
    Sedan,
    Truck,
    Van,
    Bus,
    Lorry,
    SUV,
    BabyBus,
    Motorcycle,
    Other,
    Jeep,
    MPV
}

/** 设备类型 */
export enum DeviceType {
    Unknown = '0',
    OBU = '1',
    RSU = '2',
    Other = '100',
    Camera = '200',
    Radar = '202',
    Lidar = '203',
    MEC = '204',
    SignalDevice = '205',
    MixRadar = '208'
}

/** 设备状态 */
export enum DeviceStatus {
    Online = 99,
    Offline = 1,
    Error = 2
}

/** 方案类型 */
export enum PlanType {
    /** 协调控制 */
    Coordination = 0,
    /** 手动控制 */
    Manual
}

/** 进口方向 */
export enum EnterPos {
    North = 0,
    East,
    South,
    West,
    NorthEast,
    SouthEast,
    SouthWest,
    NorthWest
}

/** 灯组颜色 */
export enum LightGroupColor {
    None = 0,
    Green,
    FlashingGreen,
    Red,
    Yellow,
    FlashingYellow,
    FlashingRed
}


/** 灯组类型 */
export enum LightGroupType {
    /** 直行箭头灯 */
    StrightArrow = 0,
    /** 左转箭头灯 */
    LeftArrow,
    /** 右转箭头灯 */
    RightArrow,
    /** 机动车灯 */
    MVehicle,
    /** 非机动车左转灯 */
    NMVehicleLeft,
    /** 非机动车右转灯 */
    NMVehicleRight,
    /** 非机动车灯 */
    NMVehicle,
    /** 行人灯 */
    Passenger
}

/** 数据包类型 */
export enum DataType {
    Device2503,
    Device2504,
    Device2505,
    Other
}

/** 预定义的颜色 */
export enum HexColor {
    Orange = 'orange',
    Red = 'red',
    Yellow = 'yellow',
    Green = 'green',
    Cyan = 'cyan',
    Blue = 'blue',
    Indigo = 'indigo',
    Purple = 'purple',
    Pink = 'pink'
}

/** GPS 类型 */
export enum GPSType {
    WGS84 = 0,
    GCJ02 = 1
}

/** 出租车状态 */
export enum TaxiStatus {
    /** 空闲 */
    Idle = 0,
    /** 忙碌 */
    Busy = 1
}

/** 行人状态 */
export enum PersonStatus {
    /** 未叫车 */
    Idle = 0,
    /** 已叫车 */
    Called = 1,
    /** 移动中 */
    Moving = 2
}

