import * as os from 'os';
import { KaserSenderConfig, KaserConfig } from './kaser.types';
import KaserService from './kaser.service';
import Transport from './transports/transport';
import { RabbitTransportConfig, RabbitTransport } from './transports/rabbit.transport';
import { HttpTransport } from './transports/http.transport';

const DEFAULT_INTERVAL = 60;
const DEFAULT_INTERVAL_MARGIN = 5;

export default class KaserSender {
    config: KaserSenderConfig;

    constructor(config: KaserSenderConfig) {
        this.config = config;
    }

    async start() {
        const kaserService: KaserService = new KaserService(
            this.config.kaserService.hostname,
            this.config.kaserService.port,
        );

        const kaserConfig: KaserConfig = await kaserService.getConfig();

        const isRmqActive = this.config.useHttp !== undefined ? this.config.useHttp : kaserConfig.rabbitMQ.isActive;
        let transport: Transport;

        if (isRmqActive) {
            const rabbitTransportConfig: RabbitTransportConfig = {
                host: this.config.rabbitMQ?.host || kaserConfig.rabbitMQ.host,
                port: this.config.rabbitMQ?.port || kaserConfig.rabbitMQ.port,
                username: this.config.rabbitMQ?.user || 'guest',
                password: this.config.rabbitMQ?.password || 'guest',
                exchange: this.config.rabbitMQ?.exchange || kaserConfig.rabbitMQ.exchange,
                routingKey: this.config.rabbitMQ?.routingKey || `test.aliveSignal`,
                exchangeType: this.config.rabbitMQ?.exchangeType || kaserConfig.rabbitMQ.exchangeType,
            };

            transport = new RabbitTransport(rabbitTransportConfig);

            await (transport as RabbitTransport).init();
            console.log('[Kaser Sender] RabbitMQ transport initialized');
        } else {
            transport = new HttpTransport(kaserService);
            console.log('[Kaser Sender] HTTP transport initialized');
        }

        let interval: number = this.config.interval || DEFAULT_INTERVAL;

        if (this.config.interval) {
            interval = this.config.interval;
        } else if (
            kaserConfig.service.maxSilenceTimeInSeconds &&
            typeof kaserConfig.service.maxSilenceTimeInSeconds === 'number'
        ) {
            interval = kaserConfig.service.maxSilenceTimeInSeconds;
        } else {
            interval = DEFAULT_INTERVAL;
        }

        interval -= this.config.intervalMargin || DEFAULT_INTERVAL_MARGIN;

        this.startSender(this.config.serviceName, interval, transport);
    }

    private startSender(serviceName: string, seconds: number, transport: Transport) {
        const interval = seconds * 1000;
        console.log(`[Kaser Sender] started with ${seconds} seconds interval`);

        transport.send(this.createAliveSignal(serviceName));

        setInterval(async () => {
            transport.send(this.createAliveSignal(serviceName));
        }, interval);
    }

    private createAliveSignal(serviceName: string) {
        return {
            hostname: os.hostname(),
            serviceName,
            aliveDate: new Date().toString(),
            upTimeInSeconds: process.uptime(),
        };
    }
}
