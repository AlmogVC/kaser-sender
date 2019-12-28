import Transport from './transport';
import { AliveSignal } from '../kaser.types';
import * as rabbitMQ from '../utils/rabbitmq';

export interface RabbitTransportConfig {
    username: string;
    password: string;
    host: string;
    port: number;
    exchange: string;
    exchangeType: string;
    routingKey: string;
}

export class RabbitTransport extends Transport {
    config: RabbitTransportConfig;

    constructor(config: RabbitTransportConfig) {
        super();
        this.config = config;
    }

    init() {
        return rabbitMQ.connect(this.config.username, this.config.password, this.config.host, this.config.port);
    }

    send(aliveSignal: AliveSignal): Promise<any> {
        return rabbitMQ.publish(this.config.exchange, this.config.exchangeType, this.config.routingKey, aliveSignal);
    }
}
