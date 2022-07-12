type StringKeyJson = Record<string, number>;

export default class DateFormat {
    /**
     * 按照模板串格式化Date对象
     * @param date - Date对象
     * @param fmt - 模板串(如'yyyy-MM-DD hh:mm:ss')
     * @returns 格式化后的时间字符串
     */
    static format(date: Date, fmt: string): string {
        const o: StringKeyJson = {
            'y+': date.getFullYear(),
            'M+': date.getMonth() + 1, //月份
            'd+': date.getDate(), //日
            'h+': date.getHours(), //小时
            'm+': date.getMinutes(), //分
            's+': date.getSeconds(), //秒
            'q+': Math.floor((date.getMonth() + 3) / 3), //季度
            S: date.getMilliseconds() //毫秒
        };
        for (const k in o) {
            const tReg = new RegExp(`(${k})`);
            const target = fmt.match(tReg);
            if (target != null) {
                if (k == 'y+') {
                    const targetLen = target[0].length;
                    let yearStr = `${o[k]}`;
                    if (targetLen == 2) {
                        yearStr = yearStr.substr(2);
                    }
                    fmt = fmt.replace(tReg, yearStr);
                } else {
                    fmt = fmt.replace(tReg, `00${o[k]}`.substring(`${o[k]}`.length));
                }
            }
        }
        return fmt;
    }
}
