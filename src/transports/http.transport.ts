import Transport from './transport';
import { AliveSignal } from '../kaser.types';
import KaserService from '../kaser.service';

export interface HttpTransportConfig {
    kaserService: KaserService;
}

export class HttpTransport extends Transport<HttpTransportConfig> {
    send(aliveSignal: AliveSignal) {
        return this.config.kaserService.sendAliveSignal(aliveSignal);
    }
}
