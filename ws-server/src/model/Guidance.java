public class Guidance {
    static final double  Speed_limit = 27;            // 最大车速 m/s        1
    static final double  delta = 1;                   // P-R time
    static final double  S_gap = 3.5;                 // 安全距离
    static final double  w = 30;                      // 交叉口宽度         1
    static final double  L = 6;                       // 车辆长度
    static final double  tau = 3;                     // 黄灯持续时间      1
    static final double  gamma = 2;                   // 全红清除时间      1
    static final double  a_comfort = 0.315;           // 舒适加速度       1
    static final double  d_max = 3.048;               // 最大减速度       1


    static final int RED = -1;
    static final int YELLOW = 0;
    static final int GREEN = 1;

    static final int CZ = 1;
    static final int DZ = 0;
    static final int SZ = -1;
    static final int OZ = 2;
    static final int SS = -2;

    static final int PASS = 1;
    static final int Crusing = 0;
    static final int STOP = -1;

    static double Recommended_speed = -1;  //建议速度
    static double tr;     //剩余时间
    static int tag;       //相位灯标志
    static double  S_ego; //距停止线距离
    static double V_ego;  //速度

    static int JudgePosition()
    {
        int position;
        if(tag == RED || tag ==YELLOW)
        {
            position = SS;
            return position;
        }
        double x0_ego = (V_ego * (tau + gamma) - w - L);
        double xc_ego = (V_ego * delta + V_ego * V_ego / (2 * d_max));
        double Stau_ego = S_ego - V_ego * tr;
        if (x0_ego < xc_ego)
        {
            if (Stau_ego < x0_ego)        position = CZ;
            else if (Stau_ego < xc_ego)   position = DZ;
            else                          position = SZ;
        }
        else position = OZ;
        return position;
    }

    static int dzAlgorithm(int position)
    {
        if(position == SS)
        {
            return STOP;
        }
        else {
            if (position == DZ || position == SZ) {
                double a_min = 2 * (S_ego + w + L - V_ego * (tr + tau + gamma)) / ((tr - delta) * (tr - delta + 2 * (tau + gamma)));
                if (a_min >= 0 && a_min < a_comfort) {
                    Recommended_speed = a_min * tr + V_ego;
                    if (Recommended_speed > Speed_limit) return STOP;
                    return PASS;
                } else {
                    return STOP;
                }
            } else {
                return Crusing;
            }
        }
    }

    public static void main(String[] args)
    {
        //////////////////////////////
        //输入
        Guidance.S_ego = 120;
        Guidance.V_ego = 10;
        Guidance.tag = 1;
        Guidance.tr = 10;

        int position = Guidance.JudgePosition();
        int ans = dzAlgorithm(position);
        double speed = 3.6 * Guidance.Recommended_speed;   //保留后两位
        String result;
        if(ans == -1)
        {
            result="STOP!";
            System.out.println(result);
        }
        else if (ans == 0)
        {
            result="PASS:Crusing";
            System.out.println(result);
        }
        else {
            String output = String.valueOf(speed);
            result = "PASS:Recommended speed:";
            System.out.println(result+output+" km/s^2");
        }
    }
}



