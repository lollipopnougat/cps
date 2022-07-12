/**
 * 随机数类
 */
export default class Random {

    /**
     * 生成范围在 [min, max] 的随机整数
     * @param min - 区间下限，区间端点可取到
     * @param max - 区间上限，区间端点可取到
     * @return 生成的随机整数
     */
    static nextInt(min: number, max: number): number;

    /**
     * 生成范围在[0, max](max > 0)或者[max, 0](max < 0)的随机整数
     * @param max - 区间上限，区间端点可取到
     * @return 生成的随机整数
     */
    static nextInt(max: number): number;
    /**
     * 生成范围在 [0, 1] 的随机整数
     * @return 生成的随机整数
     */
    static nextInt(): number;

    static nextInt(a?:number, b?: number): number {
        let max = 0;
        let min = 0;
        if (b === undefined && a !== undefined) {
            if (a > 0) {
                max = a;
            }
            else {
                min = a;
            }
        }
        else if (a === undefined) {
            max = 1;
        }
        else {
            max = b!;
            min = a!;
        }
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
        return array[Random.nextInt(max)];
    }
}