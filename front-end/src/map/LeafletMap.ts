import L from 'leaflet';
import { GPSType, HexColor } from '../model/enums';
import Random from '../utils/Random';
import GPSConvert from '../gps/GPSConvert';

/** 车辆图标 SVG */
const svgIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
<path d="M39.61 196.8L74.8 96.29C88.27 57.78 124.6 32 165.4 32H346.6C387.4 32 423.7 57.78 437.2 96.29L472.4 196.8C495.6 206.4 512 229.3 512 256V448C512 465.7 497.7 480 480 480H448C430.3 480 416 465.7 416 448V400H96V448C96 465.7 81.67 480 64 480H32C14.33 480 0 465.7 0 448V256C0 229.3 16.36 206.4 39.61 196.8V196.8zM109.1 192H402.9L376.8 117.4C372.3 104.6 360.2 96 346.6 96H165.4C151.8 96 139.7 104.6 135.2 117.4L109.1 192zM96 256C78.33 256 64 270.3 64 288C64 305.7 78.33 320 96 320C113.7 320 128 305.7 128 288C128 270.3 113.7 256 96 256zM416 320C433.7 320 448 305.7 448 288C448 270.3 433.7 256 416 256C398.3 256 384 270.3 384 288C384 305.7 398.3 320 416 320z"/>
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
        for (let [_, v] of Object.entries(HexColor)) {
            this.creatCarIcon(v);
        }

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

    /** 车辆 vid 与颜色一对一映射表 */
    private colorMap = new Map<string, HexColor>();

    /** 一对一映射表中含有的vid列表(LRU机制，最近访问的在列表尾部) */
    private vidHistory: string[] = [];

    /** vid列表信号量 */
    private vidHistoryBusy = false;

    /** 当前在地图上的车辆<vid,UI标识>Map */
    private markerMap = new Map<string, L.Marker<any>>();

    /** 当前在地图上的车辆vid列表 */
    private vehicleIds: string[] = [];

    get vehicle() {
        return this.markerMap;
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
    private getColorIcon(vid: string): L.DivIcon {
        const color = this.getColor(vid);
        return this.carIcons.get(color)!;
    }

    /**
     * 根据车辆标识分配颜色，如果已经分配过则复用以前的结果，
     * 并将车辆标识移动到历史记录列表最后
     * @param vid - 车辆标识
     * @returns 
     */
    private getColor(vid: string): HexColor {
        while (this.vidHistoryBusy);
        this.vidHistoryBusy = true;
        if (this.colorMap.has(vid)) {
            const index = this.vidHistory.findIndex(e => e == vid);
            this.vidHistory.splice(index, 1);
            this.vidHistory.push(vid);
            this.vidHistoryBusy = false;
            return this.colorMap.get(vid)!;
        }
        const color = LeafletMap.getRandomColor();
        this.colorMap.set(vid, color);
        this.vidHistory.push(vid);
        this.vidHistoryBusy = false;
        return color;
    }

    /** 
     * 利用vidHistory自动移除长期未用车辆id和颜色信息(LRU思想)
     */
    private autoRemoveColor() {
        while (this.vidHistoryBusy);
        this.vidHistoryBusy = true;
        console.log(`auto len = ${this.vidHistory.length}`);
        if (this.vidHistory.length > 100) {
            for (let i = 0; i < 50; i++) {
                const vid = this.vidHistory.shift()!;
                this.colorMap.delete(vid);
            }
            console.log('删除了50个颜色信息');
        }
        this.vidHistoryBusy = false;
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
        // console.log('set');
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
            // this.addMarker({ lat: i.lat, lng: i.lon }, this.getColorIcon(i.vid), `当前速度 ${i.speed.toFixed(3)}m/s<br>建议 ${i.suggest}`, i.vid);
        }
        for (let [_, i] of tmMap) {
            this.addMarker({ lat: i.lat, lng: i.lon }, this.getColorIcon(i.vid), `当前速度 ${i.speed.toFixed(3)}m/s<br>建议 ${i.suggest}`, i.vid);
        }


    }

    /** 清除地图上的所有车辆 */
    removeCars() {
        if (this.markerMap.size > 0) {
            const len = this.vehicleIds.length
            for (let i = 0; i < len; i++) {
                this.removeMarker(this.vehicleIds[i]);
            }
            this.vehicleIds.splice(0, len);
        }
    }

    /**
     * 在地图上添加车辆标记
     * @param latlng - 经纬度对象
     * @param icon - 标记图标
     * @param tip - 标记tooltip显示的文本
     * @param vid - 关联的车辆标识
     */
    private addMarker(latlng: LatLng, icon: L.DivIcon | L.Icon, tip: string, vid: string) {
        const marker = new L.Marker(latlng, { icon: icon });
        marker.addTo(this.map);
        if (this.tooltips) {
            marker.bindTooltip(tip, {
                permanent: true
            }).openTooltip();
        }
        this.markerMap.set(vid, marker);
    }

    /**
     * 清除地图上指定的车辆标记
     * @param vid - 指定的车辆标识
     * @returns 是否成功
     */
    private removeMarker(vid: string): boolean {
        if (this.markerMap.has(vid)) {
            const marker = this.markerMap.get(vid)!;
            this.map.removeLayer(marker);
            this.markerMap.delete(vid);
            return true;
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
            html: svgIcon,
            className: color,
            iconSize: [32, 32],
            iconAnchor: [16, 16],
            tooltipAnchor: [16, 0]
        }));
        return true;
    }

}