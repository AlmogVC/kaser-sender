import Transport from './transport';
import { AliveSignal } from '../kaser.types';
import KaserService from '../kaser.service';

export interface HttpTransportConfig {
    kaserService: KaserService;
}

export class HttpTransport extends Transport {
    kaserService: KaserService;

    constructor(kaserService: KaserService) {
        super();
        this.kaserService = kaserService;
    }
    send(aliveSignal: AliveSignal): Promise<any> {
        return this.kaserService.sendAliveSignal(aliveSignal);
    }
}
