import { redisConfig } from "../config/config";
import { createClient } from 'redis';

// 声明一个泛型类型别名，返回值与泛型类型相同，入参类型不限制。
type Reverse<T> = (arg: any) => T;

// 声明一个泛型方法，入参arg继承泛型约束，返回空对象并断言其类型为T
function returnResultType<T>(arg: Reverse<T>): T {
  return {} as T;
}

// 调用returnResultType，传入方法 (arg: any) => 3，获得result返回值
const result = returnResultType(createClient);

// 获取result类型并重名为ResultType
type MyRedisClient = typeof result;

export default class RedisCache {
    private constructor() {
        this.redisClient = createClient({
            url: `redis://${redisConfig.host}:${redisConfig.port}`
        });
    }
    private static cache: RedisCache;

    static getInstance() {
        RedisCache.cache ??= new RedisCache();
        return RedisCache.cache;
    }
    

    private redisClient: MyRedisClient;

    

}