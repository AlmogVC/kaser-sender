import * as os from 'os';
import { KaserSenderConfig, KaserConfig } from './kaser.types';
import KaserService from './kaser.service';
import Transport from './transports/transport';
import { RabbitTransportConfig, RabbitTransport } from './transports/rabbit.transport';
import { HttpTransport } from './transports/http.transport';
import { LoggingLevel, Logger } from './utils/logger';

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

        const kaserConfig: KaserConfig | undefined = await kaserService.getConfig().catch(reason => {
            Logger.log(LoggingLevel.Error, `could not connect to kaser to get config`, reason);
            return undefined;
        });

        const isRmqActive =
            this.config.useHttp !== undefined ? !this.config.useHttp : kaserConfig?.rabbitMQ.isActive || false;
        let transport: Transport;

        if (isRmqActive) {
            const rabbitTransportConfig: RabbitTransportConfig = {
                host: this.config.rabbitMQ?.host || kaserConfig?.rabbitMQ.host || 'localhost',
                port: this.config.rabbitMQ?.port || kaserConfig?.rabbitMQ.port || 5001,
                username: this.config.rabbitMQ?.user || 'guest',
                password: this.config.rabbitMQ?.password || 'guest',
                exchange: this.config.rabbitMQ?.exchange || kaserConfig?.rabbitMQ.exchange || 'kaser-exchange',
                routingKey: this.config.rabbitMQ?.routingKey || `test.aliveSignal`,
                exchangeType: this.config.rabbitMQ?.exchangeType || kaserConfig?.rabbitMQ.exchangeType || 'topic',
            };

            transport = new RabbitTransport(rabbitTransportConfig);

            const rabbitMqConnection = await (transport as RabbitTransport).init().catch(reason => {
                Logger.log(LoggingLevel.Error, `could not connect to RabbitMQ`, reason);
                return undefined;
            });

            if (rabbitMqConnection) {
                Logger.log(LoggingLevel.Debug, `RabbitMQ transport initialized`);
            }
        } else {
            transport = new HttpTransport(kaserService);
            Logger.log(LoggingLevel.Debug, `HTTP transport initialized`);
        }

        let interval: number = DEFAULT_INTERVAL;

        if (this.config.interval) {
            interval = this.config.interval;
        } else if (
            kaserConfig?.service.maxSilenceTimeInSeconds &&
            typeof kaserConfig.service.maxSilenceTimeInSeconds === 'number'
        ) {
            interval = kaserConfig.service.maxSilenceTimeInSeconds;
        }

        interval -= this.config.intervalMargin || DEFAULT_INTERVAL_MARGIN;

        this.startSender(this.config.serviceName, interval, transport);
    }

    private startSender(serviceName: string, seconds: number, transport: Transport) {
        const interval = seconds * 1000;
        Logger.log(LoggingLevel.Info, `started with ${seconds} seconds interval`);

        transport.send(this.createAliveSignal(serviceName)).catch(reason => {
            Logger.log(LoggingLevel.Error, `could not send alive signal`, reason);
        });

        setInterval(async () => {
            transport.send(this.createAliveSignal(serviceName)).catch(reason => {
                Logger.log(LoggingLevel.Warning, `could not send alive signal`);
            });
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
