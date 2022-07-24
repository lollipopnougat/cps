import L from 'leaflet';
import { GPSType, HexColor } from '../model/enums';
import Random from '../utils/Random';
import GPSConvert from '../gps/GPSConvert';
import StatusParser from '../model/StatusParser';

/** 车辆图标 SVG */
const svgCarIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
<path d="M39.61 196.8L74.8 96.29C88.27 57.78 124.6 32 165.4 32H346.6C387.4 32 423.7 57.78 437.2 96.29L472.4 196.8C495.6 206.4 512 229.3 512 256V448C512 465.7 497.7 480 480 480H448C430.3 480 416 465.7 416 448V400H96V448C96 465.7 81.67 480 64 480H32C14.33 480 0 465.7 0 448V256C0 229.3 16.36 206.4 39.61 196.8V196.8zM109.1 192H402.9L376.8 117.4C372.3 104.6 360.2 96 346.6 96H165.4C151.8 96 139.7 104.6 135.2 117.4L109.1 192zM96 256C78.33 256 64 270.3 64 288C64 305.7 78.33 320 96 320C113.7 320 128 305.7 128 288C128 270.3 113.7 256 96 256zM416 320C433.7 320 448 305.7 448 288C448 270.3 433.7 256 416 256C398.3 256 384 270.3 384 288C384 305.7 398.3 320 416 320z"/>
</svg>`;

const svgTaxiIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512">
<path d="M352 0C369.7 0 384 14.33 384 32V64L384 64.15C422.6 66.31 456.3 91.49 469.2 128.3L504.4 228.8C527.6 238.4 544 261.3 544 288V480C544 497.7 529.7 512 512 512H480C462.3 512 448 497.7 448 480V432H128V480C128 497.7 113.7 512 96 512H64C46.33 512 32 497.7 32 480V288C32 261.3 48.36 238.4 71.61 228.8L106.8 128.3C119.7 91.49 153.4 66.31 192 64.15L192 64V32C192 14.33 206.3 0 224 0L352 0zM197.4 128C183.8 128 171.7 136.6 167.2 149.4L141.1 224H434.9L408.8 149.4C404.3 136.6 392.2 128 378.6 128H197.4zM128 352C145.7 352 160 337.7 160 320C160 302.3 145.7 288 128 288C110.3 288 96 302.3 96 320C96 337.7 110.3 352 128 352zM448 288C430.3 288 416 302.3 416 320C416 337.7 430.3 352 448 352C465.7 352 480 337.7 480 320C480 302.3 465.7 288 448 288z"/>
</svg>`;

const svgPersonIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512">
<path d="M208 48C208 74.51 186.5 96 160 96C133.5 96 112 74.51 112 48C112 21.49 133.5 0 160 0C186.5 0 208 21.49 208 48zM152 352V480C152 497.7 137.7 512 120 512C102.3 512 88 497.7 88 480V256.9L59.43 304.5C50.33 319.6 30.67 324.5 15.52 315.4C.3696 306.3-4.531 286.7 4.573 271.5L62.85 174.6C80.2 145.7 111.4 128 145.1 128H174.9C208.6 128 239.8 145.7 257.2 174.6L315.4 271.5C324.5 286.7 319.6 306.3 304.5 315.4C289.3 324.5 269.7 319.6 260.6 304.5L232 256.9V480C232 497.7 217.7 512 200 512C182.3 512 168 497.7 168 480V352L152 352z"/>
</svg>`;

export default class LeafletMap {
    /**
     * 创建一个绑定到指定容器的Leaflet地图
     * @param id - 地图容器元素id
     */
    constructor(id: string) {
        this.map = L.map(id);
        this.tileLayer = L.tileLayer(
            'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
            {
                attribution: 'Data by \u0026copy; \u003ca href="http://openstreetmap.org"\u003eOpenStreetMap\u003c/a\u003e, under \u003ca href="http://www.openstreetmap.org/copyright"\u003eODbL\u003c/a\u003e.',
                detectRetina: false,
                maxNativeZoom: 18,
                maxZoom: 18,
                minZoom: 0,
                noWrap: false,
                opacity: 1,
                subdomains: 'abc',
                tms: false
            }
        );

        this.tileLayer.addTo(this.map);
        // for (let [_, v] of Object.entries(HexColor)) {
        //     this.creatCarIcon(v);
        // }
        Object.entries(HexColor).forEach(([_, e]) => { this.creatCarIcon(e); this.creatTaxiIcon(e); this.creatPersonIcon(e); });
        // 设置自动清理长期未使用的vid颜色信息
        setInterval(() => {
            this.autoRemoveColor();
        }, this.autoClearColorInterval * 1000);
    }

    private tooltips: boolean = false;

    /** Leaflet地图实例 */
    private map: L.Map;

    /** 自动清理间隔，单位秒 */
    private autoClearColorInterval = 20;

    /** 地图瓦片参数 */
    private tileLayer: L.TileLayer;

    /** 预加载的车辆图标库，按颜色索引 */
    private carIcons = new Map<HexColor, L.DivIcon>();

    /** 预加载的网约车图标库，按颜色索引 */
    private taxiIcons = new Map<HexColor, L.DivIcon>();

    /** 预加载的行人图标库，按颜色索引 */
    private personIcons = new Map<HexColor, L.DivIcon>();

    /** 车辆 vid 与颜色一对一映射表 */
    private carColorMap = new Map<string, HexColor>();

    /** 网约车 tid 与颜色一对一映射表 */
    private taxiColorMap = new Map<string, HexColor>();

    /** 行人 pid 与颜色一对一映射表 */
    private personColorMap = new Map<string, HexColor>();

    /** 一对一映射表中含有的vid列表(LRU机制，最近访问的在列表尾部) */
    //private vidHistory: string[] = [];

    /** vid颜色信号量 */
    //private vidHistoryBusy = false;

    /** 当前在地图上的车辆<vid,UI标识>Map */
    private markerCarMap = new Map<string, L.Marker<any>>();

    /** 当前在地图上的车辆vid列表 */
    private vehicleIds: string[] = [];

    /** 当前在地图上的网约车<id, UI标识>Map */
    private taxis: Map<string, L.Marker<any>> = new Map();

    /** 当前在地图上的网约车id列表 */
    private taxiIds: string[] = [];

    /** 当前在地图上的行人<id, UI标识>Map */
    private persons: Map<string, L.Marker<any>> = new Map();

    /** 当前在地图上的行人id列表 */
    private personIds: string[] = [];

    get vehicle() {
        return this.markerCarMap;
    }

    /** 颜色列表 */
    private static readonly colors = [HexColor.Blue, HexColor.Cyan, HexColor.Green, HexColor.Indigo, HexColor.Orange, HexColor.Pink, HexColor.Purple, HexColor.Red, HexColor.Yellow];

    /** 获取随机颜色 */
    private static getRandomColor(): HexColor {
        return Random.choice(LeafletMap.colors);
    }

    // private getRandomColorIcon(): L.DivIcon {
    //     const color = LeafletMap.getRandomColor();
    //     return this.carIcons.get(color)!;
    // }

    /**
     * 根据车辆标识获取指定颜色的图标
     * @param vid - 车辆标识
     * @returns 指定颜色的图标
     */
    private getColorCarIcon(vid: string): L.DivIcon {
        const color = this.getColor(vid);
        return this.carIcons.get(color)!;
    }

    /**
     * 根据网约车标识获取指定颜色的图标
     * @param tid - 网约车标识
     * @returns 指定颜色的图标
     */
    private getColorTaxiIcon(tid: string): L.DivIcon {
        const color = this.getColor(tid);
        const tmp = this.taxiIcons.get(color)!;
        return tmp;
    }

    /**
     * 根据行人标识获取指定颜色的图标
     * @param tid - 行人标识
     * @returns 指定颜色的图标
     */
    private getColorPersonIcon(pid: string): L.DivIcon {
        const color = this.getColor(pid);
        return this.personIcons.get(color)!;
    }

    /**
     * 根据标识分配颜色，如果已经分配过则复用以前的结果，
     * 并将标识移动到历史记录最后
     * @param vid - 车辆标识
     * @returns 
     */
    private getColor(vid: string): HexColor {
        if (this.carColorMap.has(vid)) {
            const color = this.carColorMap.get(vid)!;
            this.carColorMap.delete(vid);
            this.carColorMap.set(vid, color);
            return color;
        }
        const color = LeafletMap.getRandomColor();
        this.carColorMap.set(vid, color);
        return color;
    }

    /** 
     * 利用Map自动移除长期未用车辆id和颜色信息(LRU思想)
     */
    private autoRemoveColor() {
        const list: string[] = [];
        let c = 50;
        for (let [i, _] of this.carColorMap) {
            list.push(i);
            c--;
            if (c == 0) {
                break;
            }
        }
        list.forEach(e => this.carColorMap.delete(e));
        console.log('删除了50个颜色信息');
    }


    set tooltipStatus(val: boolean) {
        this.tooltips = val;
    }

    get tooltipStatus() {
        return this.tooltips;
    }

    /** 设置地图中心点和缩放 */
    setView(latlng: LatLng, zoom = 16) {
        this.map.setView(latlng, zoom);
    }

    /**
     * 在地图上放置多个车辆
     * @param vehicles - 车辆信息数组
     */
    setCars(vehicles: VehicleStruct[]) {
        this.removeCars();
        const tmMap = new Map<string, VehicleStruct>();
        for (let i of vehicles) {
            this.vehicleIds.push(i.vid);
            if (i.gpsType == GPSType.GCJ02) {
                const latlng = GPSConvert.gcj02ToWGS84(i.lat, i.lon);
                i.lat = latlng.lat;
                i.lon = latlng.lng;
            }
            tmMap.set(i.vid, i);
        }
        tmMap.forEach(e => this.addCarMarker({ lat: e.lat, lng: e.lon }, this.getColorCarIcon(e.vid), `当前速度 ${e.speed.toFixed(3)}m/s<br>建议 ${e.suggest}`, e.vid));
    }

    /**
     * 在地图上放置多个网约车
     * @param taxis - 网约车信息数组
     */
    setTaxis(taxis: TaxiStruct[]) {
        this.removeTaxis();
        const tmMap = new Map<string, TaxiStruct>();
        for (let i of taxis) {
            this.taxiIds.push(i.tid);
            // if (i.gpsType == GPSType.GCJ02) {
            //     const latlng = GPSConvert.gcj02ToWGS84(i.lat, i.lon);
            //     i.lat = latlng.lat;
            //     i.lon = latlng.lng;
            // }
            tmMap.set(i.tid, i);
        }
        tmMap.forEach(e => this.addTaxiMarker({ lat: e.lat, lng: e.lon }, this.getColorTaxiIcon(e.tid), `当前速度 ${e.speed.toFixed(3)}m/s<br>建议 ${e.suggest}<br>状态 ${StatusParser.parseTaxi(e.state)}`, e.tid));
    }

    /**
     * 在地图上放置多个行人
     * @param persons - 行人信息数组
     */
    setPersons(persons: PersonStruct[]) {
        this.removePersons();
        const tmMap = new Map<string, PersonStruct>();
        for (let i of persons) {
            this.personIds.push(i.pid);
            // if (i.gpsType == GPSType.GCJ02) {
            //     const latlng = GPSConvert.gcj02ToWGS84(i.lat, i.lon);
            //     i.lat = latlng.lat;
            //     i.lon = latlng.lng;
            // }
            tmMap.set(i.pid, i);
        }
        tmMap.forEach(e => this.addPersonMarker({ lat: e.lat, lng: e.lon }, this.getColorPersonIcon(e.pid), `状态 ${StatusParser.parsePerson(e.state)}`, e.pid));
    }

    /** 清除地图上的所有车辆 */
    removeCars() {
        if (this.markerCarMap.size > 0) {
            this.vehicleIds.forEach(e => this.removeCarMarker(e));
            this.vehicleIds.splice(0, this.vehicleIds.length);
        }
    }

    /** 清除地图上的所有网约车 */
    removeTaxis() {
        if (this.taxis.size > 0) {
            this.taxiIds.forEach(e => this.removeTaxiMarker(e));
            this.taxiIds.splice(0, this.taxiIds.length);
        }
    }

    /** 清除地图上的所有行人 */
    removePersons() {
        if (this.persons.size > 0) {
            this.personIds.forEach(e => this.removePersonMarker(e));
            this.personIds.splice(0, this.personIds.length);
        }
    }

    /**
     * 在地图上添加车辆标记
     * @param latlng - 经纬度对象
     * @param icon - 标记图标
     * @param tip - 标记tooltip显示的文本
     * @param vid - 关联的车辆标识
     */
    private addCarMarker(latlng: LatLng, icon: L.DivIcon | L.Icon, tip: string, vid: string) {
        const marker = new L.Marker(latlng, { icon: icon });
        marker.addTo(this.map);
        if (this.tooltips) {
            marker.bindTooltip(tip, {
                permanent: true
            }).openTooltip();
        }
        this.markerCarMap.set(vid, marker);
    }

    /**
     * 在地图上添加网约车标记
     * @param latlng - 经纬度对象
     * @param icon - 标记图标
     * @param tip - 标记tooltip显示的文本
     * @param tid - 关联的网约车标识
     */
    private addTaxiMarker(latlng: LatLng, icon: L.DivIcon | L.Icon, tip: string, tid: string) {
        const marker = new L.Marker(latlng, { icon: icon });
        marker.addTo(this.map);
        if (this.tooltips) {
            marker.bindTooltip(tip, {
                permanent: true
            }).openTooltip();
        }
        this.taxis.set(tid, marker);
    }

    /**
     * 在地图上添加行人标记
     * @param latlng - 经纬度对象
     * @param icon - 标记图标
     * @param tip - 标记tooltip显示的文本
     * @param pid - 关联的行人标识
     */
    private addPersonMarker(latlng: LatLng, icon: L.DivIcon | L.Icon, tip: string, pid: string) {
        const marker = new L.Marker(latlng, { icon: icon });
        marker.addTo(this.map);
        if (this.tooltips) {
            marker.bindTooltip(tip, {
                permanent: true
            }).openTooltip();
        }
        this.persons.set(pid, marker);
    }

    /**
     * 清除地图上指定的车辆标记
     * @param vid - 指定的车辆标识
     * @returns 是否成功
     */
    private removeCarMarker(vid: string): boolean {
        if (this.markerCarMap.has(vid)) {
            const marker = this.markerCarMap.get(vid)!;
            this.map.removeLayer(marker);
            return this.markerCarMap.delete(vid);
        }
        return false;
    }

    /**
     * 清除地图上指定的网约车标记
     * @param tid - 指定的网约车标识
     * @returns 是否成功
     */
    private removeTaxiMarker(tid: string): boolean {
        if (this.taxis.has(tid)) {
            const marker = this.taxis.get(tid)!;
            this.map.removeLayer(marker);
            return this.taxis.delete(tid);
        }
        return false;
    }

    /**
     * 清除地图上指定的行人标记
     * @param tid - 指定的网约车标识
     * @returns 是否成功
     */
    private removePersonMarker(tid: string): boolean {
        if (this.persons.has(tid)) {
            const marker = this.persons.get(tid)!;
            this.map.removeLayer(marker);
            return this.persons.delete(tid);
        }
        return false;
    }

    /**
     * 使用预加载图标创建特定颜色的车辆图标
     * @param color - 图标颜色 
     * @returns 是否创建成功
     */
    private creatCarIcon(color: HexColor): boolean {
        if (this.carIcons.has(color)) {
            return false;
        }
        this.carIcons.set(color, new L.DivIcon({
            html: svgCarIcon,
            className: color,
            iconSize: [32, 32],
            iconAnchor: [16, 16],
            tooltipAnchor: [16, 0]
        }));
        return true;
    }

    /**
     * 使用预加载图标创建特定颜色的网约车图标
     * @param color - 图标颜色 
     * @returns 是否创建成功
     */
    private creatTaxiIcon(color: HexColor): boolean {
        if (this.taxiIcons.has(color)) {
            return false;
        }
        this.taxiIcons.set(color, new L.DivIcon({
            html: svgTaxiIcon,
            className: color,
            iconSize: [36, 32],
            iconAnchor: [18, 16],
            tooltipAnchor: [18, 0]
        }));
        return true;
    }

    /**
     * 使用预加载图标创建特定颜色的行人图标
     * @param color - 图标颜色 
     * @returns 是否创建成功
     */
    private creatPersonIcon(color: HexColor): boolean {
        if (this.personIcons.has(color)) {
            return false;
        }
        this.personIcons.set(color, new L.DivIcon({
            html: svgPersonIcon,
            className: color,
            iconSize: [20, 32],
            iconAnchor: [10, 16],
            tooltipAnchor: [10, 0]
        }));
        return true;
    }

}