import DateFormat from "./DateUtils/DateFormat";

export default class ColorConsole {
    /**
     * 控制台输出彩色log信息. 
     * 分隔符为{}时，字符串格式为 '普通文本{}特定颜色文本{}普通文本'
     * @param msg - 信息本体
     * @param color - 颜色(默认为ColorConsole.WHITE)
     * @param separator - 分隔符(默认为'{}')
     */
    static log(msg: string, color = ColorConsole.WHITE, separator = '{}') {
        const tmp = msg.split(separator);
        console.log(`${DateFormat.format(new Date(), 'yyyy/MM/dd hh:mm:ss')} ${tmp[0]}\x1b[${color}m${tmp[1]}\x1b[0m${tmp[2]}`);
    }
    static readonly BLACK = 30;
    static readonly RED = 31;
    static readonly GREEN = 32;
    static readonly YELLOW = 33;
    static readonly BLUE = 34;
    static readonly MAGENTA = 35;
    static readonly CYAN = 36;
    static readonly WHITE = 37;
}