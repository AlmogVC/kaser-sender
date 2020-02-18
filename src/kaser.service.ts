import { KaserConfig, AliveSignal } from './kaser.types';
import { httpGet, httpPost } from './utils/http.helper';

export default class KaserService {
    constructor(private hostname: string, private port: number, private protocol: 'http' | 'https' = 'http') {}

    public getConfig(): Promise<KaserConfig> {
        return httpGet(this.protocol, this.hostname, this.port, `/api/config`);
    }

    public sendAliveSignal(aliveSignal: AliveSignal) {
        return httpPost(this.protocol, this.hostname, this.port, '/api/aliveSignal', aliveSignal);
    }
}
