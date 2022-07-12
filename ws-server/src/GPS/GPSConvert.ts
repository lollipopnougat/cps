interface LatLng {
    lat: number;
    lng: number;
}

export default class GPSConvert {
    private static readonly xPi = 3.14159265358979324 * 3000.0 / 180.0;
    private static readonly pi = 3.1415926535897932384626  // π
    private static readonly a = 6378245.0  // 长半轴
    private static readonly ee = 0.00669342162296594323  // 扁率

    private static outOfChina(lat: number, lng: number): boolean {
        if (lng < 72.004 || lng > 137.8347) {
            return true;
        }
        else if (lat < 0.8293 || lat > 55.8271) {
            return true
        }
        return false;
    }

    private static transformLat(lat: number, lng: number): number {
        let ret = -100 + 2 * lng + 3 * lat + 0.2 * lat * lat + 0.1 * lng * lat + 0.2 * Math.sqrt(Math.abs(lng));
        ret += (20 * Math.sin(6 * lng * GPSConvert.pi) + 20 * Math.sin(2 * lng * GPSConvert.pi)) * 2 / 3;
        ret += (20 * Math.sin(lat * GPSConvert.pi) + 40 * Math.sin(lat / 3 * GPSConvert.pi)) * 2 / 3;
        ret += (160 * Math.sin(lat / 12 * GPSConvert.pi) + 320 * Math.sin(lat * GPSConvert.pi / 30)) * 2 / 3;
        return ret;
    }

    private static transformLng(lat: number, lng: number): number {
        let ret = 300 + lng + 2 * lat + 0.1 * lng * lng + 0.1 * lng * lat + 0.1 * Math.sqrt(Math.abs(lng));
        ret += (20 * Math.sin(6 * lng * GPSConvert.pi) + 20 * Math.sin(2 * lng * GPSConvert.pi)) * 2 / 3;
        ret += (20 * Math.sin(lng * GPSConvert.pi) + 40 * Math.sin(lng / 3 * GPSConvert.pi)) * 2 / 3;
        ret += (150 * Math.sin(lng / 12 * GPSConvert.pi) + 300 * Math.sin(lng / 30 * GPSConvert.pi)) * 2 / 3;
        return ret;
    }
    static gcj02ToWGS84(lat: number, lng: number): LatLng;
    static gcj02ToWGS84(latLng: LatLng): LatLng;
    static gcj02ToWGS84(arg0: number | LatLng, arg1?: number): LatLng {
        let lat = 0;
        let lng = 0;
        if (typeof(arg0) === 'number') {
            lat = arg0;
            lng = arg1!;
        }
        else {
            lat = arg0.lat;
            lng = arg0.lng;
        }
        if (GPSConvert.outOfChina(lat, lng)) {
            return {
                lat,
                lng
            };
        }
        let dLat = GPSConvert.transformLat(lat - 35, lng - 105);
        let dLng = GPSConvert.transformLng(lat - 35, lng - 105);
        const radLat = lat / 180 * GPSConvert.pi;
        let magic = Math.sin(radLat);
        magic = 1 - GPSConvert.ee * magic * magic;
        let sqrtMagic = Math.sqrt(magic);
        dLat = (dLat * 180.0) / ((GPSConvert.a * (1 - GPSConvert.ee)) / (magic * sqrtMagic) * GPSConvert.pi);
        dLng = (dLng * 180.0) / (GPSConvert.a / sqrtMagic * Math.cos(radLat) * GPSConvert.pi);
        const mgLat = lat + dLat;
        const mgLng = lng + dLng;
        return {
            lat: lat * 2 - mgLat,
            lng: lng * 2 - mgLng
        };
    }

}