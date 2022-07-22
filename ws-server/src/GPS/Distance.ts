export default class VincentyDisCal {

    private static readonly a = 6378137;
    private static readonly b = 6356752.314245;
    private static readonly f = 1 / 298.257223563;
    /** 长半径a=6378137 */
    //private static final double 
    /** 短半径b=6356752.314245 */
    //private static final double b = 6356752.314245;
    /** 扁率f=1/298.257223563 */
    //private static final double f = 1 / 298.257223563;

    /**
     * 根据提供的经纬度计算两点间距离
     *
     * @param lat_one - 坐标1纬度
     * @param lon_one - 坐标1经度
     * @param lat_two - 坐标2纬度
     * @param lon_two - 坐标2经度
     * @return 两点间距离
     */
    public static calDistance(lat_one: number, lon_one: number, lat_two: number, lon_two: number): number {
        const L = VincentyDisCal.toRadians(lon_one - lon_two);
        const U1 = Math.atan((1 - VincentyDisCal.f) * Math.tan(VincentyDisCal.toRadians(lat_one)));
        const U2 = Math.atan((1 - VincentyDisCal.f) * Math.tan(VincentyDisCal.toRadians(lat_two)));
        const sinU1 = Math.sin(U1), cosU1 = Math.cos(U1);
        const sinU2 = Math.sin(U2), cosU2 = Math.cos(U2);
        let lambda = L;
        let lambdaP = Math.PI;

        let cosSqAlpha = 0;
        let sinSigma = 0;
        let cos2SigmaM = 0;
        let cosSigma = 0;
        let sigma = 0;
        let circleCount = 40;
        //迭代循环
        while (Math.abs(lambda - lambdaP) > 1e-12 && --circleCount > 0) {
            const sinLambda = Math.sin(lambda);
            const cosLambda = Math.cos(lambda);
            sinSigma = Math.sqrt((cosU2 * sinLambda) * (cosU2 * sinLambda) + (cosU1 * sinU2 - sinU1 * cosU2 * cosLambda) * (cosU1 * sinU2 - sinU1 * cosU2 * cosLambda));
            if (sinSigma == 0) {
                return 0;  // co-incident points
            }
            cosSigma = sinU1 * sinU2 + cosU1 * cosU2 * cosLambda;
            sigma = Math.atan2(sinSigma, cosSigma);
            let alpha = Math.asin(cosU1 * cosU2 * sinLambda / sinSigma);
            cosSqAlpha = Math.cos(alpha) * Math.cos(alpha);
            cos2SigmaM = cosSigma - 2 * sinU1 * sinU2 / cosSqAlpha;
            const C = VincentyDisCal.f / 16 * cosSqAlpha * (4 + VincentyDisCal.f * (4 - 3 * cosSqAlpha));
            const lambdaP = lambda;
            lambda = L + (1 - C) * VincentyDisCal.f * Math.sin(alpha) *
                (sigma + C * sinSigma * (cos2SigmaM + C * cosSigma * (-1 + 2 * cos2SigmaM * cos2SigmaM)));
        }
        if (circleCount == 0) {
            return NaN;  // formula failed to converge
        }
        const uSq = cosSqAlpha * (VincentyDisCal.a * VincentyDisCal.a - VincentyDisCal.b * VincentyDisCal.b) / (VincentyDisCal.b * VincentyDisCal.b);
        const A = 1 + uSq / 16384 * (4096 + uSq * (-768 + uSq * (320 - 175 * uSq)));
        const B = uSq / 1024 * (256 + uSq * (-128 + uSq * (74 - 47 * uSq)));
        const deltaSigma = B * sinSigma * (cos2SigmaM + B / 4 * (cosSigma * (-1 + 2 * cos2SigmaM * cos2SigmaM) - B / 6 * cos2SigmaM * (-3 + 4 * sinSigma * sinSigma) * (-3 + 4 * cos2SigmaM * cos2SigmaM)));
        const result = VincentyDisCal.b * A * (sigma - deltaSigma);
        //DecimalFormat format = new DecimalFormat("0.000");
        const distance = Math.floor(result * 1000) / 1000;//Double.parseDouble(format.format(result));
        return distance;
    }

    /**
     * 根据提供的角度值，将其转化为弧度
     *
     * @param angle - 角度值
     * @return 结果
     */
    public static toRadians(angle: number): number {
        let result = 0;
        if (angle != null) {
            result = angle * Math.PI / 180;
        }
        return result;
    }

    static getDistance(lat0: number, lng0: number, lat1: number, lng1: number): number;
    static getDistance(latLng0: LatLng, latLng1: LatLng): number;
    static getDistance(lat0: number | LatLng, lng0: number | LatLng, lat1?: number, lng1?: number): number {
        if (lat1 !== undefined && lng1 !== undefined) {
            return VincentyDisCal.calDistance(lat0 as number, lng0 as number, lat1, lng1);
        }
        else {
            const latlng0 = lat0 as LatLng;
            const latlng1 = lng0 as LatLng;
            return VincentyDisCal.calDistance(latlng0.lat, latlng0.lng, latlng1.lat, latlng1.lng);
        }
    }


    // public static void main(String[] args) {
    //     // TODO Auto-generated method stub
    //     //坐标1经度
    //     double lon_one = -5.71475;
    //     //坐标1纬度
    //     double lat_one = 50.06632;
    //     //坐标2经度
    //     double lon_two = -3.07009;
    //     //坐标2纬度
    //     double lat_two = 58.64402;
    //     double distance = DistanceCalculateOfVincentyUtil.getDistance(lat_one, lon_one, lat_two, lon_two);
    //     System.out.println(distance);
    // }

}