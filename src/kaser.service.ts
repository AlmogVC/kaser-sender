import { KaserConfig, AliveSignal } from './kaser.types';
import { httpGet, httpPost } from './http.helper';

export default class KaserService {
    constructor(private hostname: string, private port: number) {}

    public getConfig(): Promise<KaserConfig> {
        return httpGet(this.hostname, this.port, `/api/config`);
    }

    public sendAliveSignal(aliveSignal: AliveSignal) {
        return httpPost(this.hostname, this.port, '/api/aliveSignal', aliveSignal);
    }
}
