import Transport from './transport';
import { AliveSignal } from '../kaser.types';
import RabbitMQ from '../utils/rabbitmq';

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
    rabbitMQ: RabbitMQ;

    constructor(config: RabbitTransportConfig) {
        super();
        this.config = config;
        this.rabbitMQ = new RabbitMQ(this.config.username, this.config.password, this.config.host, this.config.port);
    }

    init() {
        return this.rabbitMQ.connect();
    }

    async send(aliveSignal: AliveSignal): Promise<any> {
        if (!this.rabbitMQ.connection) {
            await this.init();
        }

        return this.rabbitMQ.publish(
            this.config.exchange,
            this.config.exchangeType,
            this.config.routingKey,
            aliveSignal,
        );
    }
}
