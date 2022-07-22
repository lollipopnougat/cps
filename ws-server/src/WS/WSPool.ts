import WebSocket from 'ws';
import ColorConsole from '../ColorConsole';

export default class WSPool {
    constructor() {
        
    }
    
    private pool: Map<number, WebSocket> = new Map();
    private curId = 0;

    /**
     * 使用url创建ws客户端并加入连接池
     * @param url - ws地址
     * @returns 建立的ws客户端id
     */
    addConnection(url: string) {
        const cid = this.curId;
        this.curId++;
        const client = new WebSocket(url);
        this.pool.set(cid, client);

        client.addEventListener("close", () => {
            this.pool.delete(cid);
        });

        client.addEventListener("error", (e) => {
            ColorConsole.log(`{}Error: ${e.message}{}`, ColorConsole.RED);
        });

        client.addEventListener("open", () => {
            
        });
        return cid;
    }
    
    
}