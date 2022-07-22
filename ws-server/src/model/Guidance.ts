import { SuggestValue, GLightColor, SuggestRT } from "./enums";


export default class Guidance {
    static readonly Speed_limit = 27;    // 最大车速 m/s    1
    static readonly delta = 1;       // P-R time
    static readonly S_gap = 3.5;       // 安全距离
    static readonly w = 30;        // 交叉口宽度   1
    static readonly L = 6;         // 车辆长度
    static readonly tau = 3;       // 黄灯持续时间  1
    static readonly gamma = 2;       // 全红清除时间  1
    static readonly a_comfort = 0.315;     // 舒适加速度   1
    static readonly d_max = 3.048;     // 最大减速度   1

    // static readonly RED = -1;
    // static readonly YELLOW = 0;
    // static readonly GREEN = 1;

    static readonly CZ = 1;
    static readonly DZ = 0;
    static readonly SZ = -1;
    static readonly OZ = 2;
    static readonly SS = -2;

    // static readonly PASS = 1;
    // static readonly Crusing = 0;
    // static readonly STOP = -1;

    static Recommended_speed = -1;  //建议速度
    static tr: number;   //剩余时间
    static tag: number;   //相位灯标志
    static S_ego: number; //距停止线距离
    static V_ego: number;  //速度

    static JudgePosition() {
        let position: number;
        if (Guidance.tag == GLightColor.RED || Guidance.tag == GLightColor.YELLOW) {
            position = Guidance.SS;
            return position;
        }
        let x0_ego = (Guidance.V_ego * (Guidance.tau + Guidance.gamma) - Guidance.w - Guidance.L);
        let xc_ego = (Guidance.V_ego * Guidance.delta + Guidance.V_ego * Guidance.V_ego / (2 * Guidance.d_max));
        let Stau_ego = Guidance.S_ego - Guidance.V_ego * Guidance.tr;
        if (x0_ego < xc_ego) {
            if (Stau_ego < x0_ego) position = Guidance.CZ;
            else if (Stau_ego < xc_ego) position = Guidance.DZ;
            else position = Guidance.SZ;
        }
        else {
            position = Guidance.OZ;
        }
        return position;
    }

    static dzAlgorithm(position: number): number {
        if (position == Guidance.SS) {
            return SuggestValue.STOP;
        }
        else {
            if (position == Guidance.DZ || position == Guidance.SZ) {
                let a_min = 2 * (Guidance.S_ego + Guidance.w + Guidance.L - Guidance.V_ego * (Guidance.tr + Guidance.tau + Guidance.gamma)) / ((Guidance.tr - Guidance.delta) * (Guidance.tr - Guidance.delta + 2 * (Guidance.tau + Guidance.gamma)));
                if (a_min >= 0 && a_min < Guidance.a_comfort) {
                    Guidance.Recommended_speed = a_min * Guidance.tr + Guidance.V_ego;
                    if (Guidance.Recommended_speed > Guidance.Speed_limit) { return SuggestValue.STOP; }
                    return SuggestValue.PASS;
                } else {
                    return SuggestValue.STOP;
                }
            } else {
                return SuggestValue.Crusing;
            }
        }
    }

    /**
     * 过路口建议算法
     * @param timeRe - 剩余时间
     * @param lightColor - 相位灯标志
     * @param dis - 距停止线距离
     * @param speed - 速度
     * @returns - 过路口建议以及速度
     */
    static cal(timeRe: number, lightColor: GLightColor, dis: number, speed: number): GuidanceRT {
        // static tr: number;   //剩余时间
        // static tag: number;   //相位灯标志
        // static S_ego: number; //距停止线距离
        // static V_ego: number;  //速度
        Guidance.S_ego = dis;
        Guidance.V_ego = speed;
        Guidance.tag = lightColor;
        Guidance.tr = timeRe;
        let position = Guidance.JudgePosition();
        let ans = Guidance.dzAlgorithm(position);
        let rt: SuggestRT = SuggestRT.PASS;
        switch (ans) {
            case SuggestValue.Crusing:
                rt = SuggestRT.Crusing;break;
            case SuggestValue.PASS:
                rt = SuggestRT.PASS;break;
            case SuggestValue.STOP:
                rt = SuggestRT.STOP;break;
        } 
        return {
            type: rt,
            speed: 3.6 * Guidance.Recommended_speed
        }
    }

    // static main() {
    //     //////////////////////////////
    //     //输入
    //     Guidance.S_ego = 120;
    //     Guidance.V_ego = 10;
    //     Guidance.tag = 1;
    //     Guidance.tr = 10;

    //     let position = Guidance.JudgePosition();
    //     let ans = Guidance.dzAlgorithm(position);
    //     let speed = 3.6 * Guidance.Recommended_speed; //保留后两位
    //     let result: string;
    //     if (ans == -1) {
    //         result = "STOP!";
    //         console.log(result);
    //     }
    //     else if (ans == 0) {
    //         result = "PASS:Crusing";
    //         console.log(result);
    //     }
    //     else {
    //         let output = speed.toString();
    //         result = "PASS:Recommended speed:";
    //         console.log(result + output + " km/s^2");
    //     }
    // }
}

// Guidance.main();

