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
    async start(userConfig: KaserSenderConfig) {
        const kaserService: KaserService = new KaserService(
            userConfig.kaserService.hostname,
            userConfig.kaserService.port,
            userConfig.kaserService.protocol,
        );

        let kaserConfig: KaserConfig | undefined;

        if (userConfig.useKasersConfig) {
            kaserConfig = await kaserService.getConfig().catch(reason => {
                Logger.log(LoggingLevel.Error, `could not connect to kaser to get config`, reason);
                return undefined;
            });
        }

        const transport: Transport = await this.getTransport(kaserService, userConfig, kaserConfig);

        const interval: number = this.getInterval(userConfig, kaserConfig);

        this.startSender(userConfig.serviceName, interval, transport);
    }

    private async getTransport(
        kaserService: KaserService,
        userConfig: KaserSenderConfig,
        kaserConfig: KaserConfig | undefined,
    ) {
        let useRabbitMqTransport: boolean;

        if (kaserConfig) {
            useRabbitMqTransport = kaserConfig?.rabbitMQ?.isActive;
        } else {
            useRabbitMqTransport = !userConfig.useHttpTransport || false;
        }

        let transport: Transport;

        if (useRabbitMqTransport) {
            transport = new RabbitTransport(this.getRabbitMqConfig(userConfig, kaserConfig));

            const rabbitMqConnection = await (transport as RabbitTransport).init().catch(reason => {
                return undefined;
            });

            if (rabbitMqConnection) {
                Logger.log(LoggingLevel.Debug, `RabbitMQ transport initialized`);
            }
        } else {
            transport = new HttpTransport(kaserService);
            Logger.log(LoggingLevel.Debug, `HTTP transport initialized`);
        }

        return transport;
    }

    private getInterval(userConfig: KaserSenderConfig, kaserConfig: KaserConfig | undefined): number {
        let interval: number = DEFAULT_INTERVAL;

        if (userConfig.interval) {
            interval = userConfig.interval;
        } else if (
            kaserConfig?.service.maxSilenceTimeInSeconds &&
            typeof kaserConfig.service.maxSilenceTimeInSeconds === 'number'
        ) {
            interval = kaserConfig.service.maxSilenceTimeInSeconds;
        }

        interval -= userConfig.intervalMargin || DEFAULT_INTERVAL_MARGIN;

        return interval;
    }

    private getRabbitMqConfig(
        userConfig: KaserSenderConfig,
        kaserConfig: KaserConfig | undefined,
    ): RabbitTransportConfig {
        return {
            host: kaserConfig?.rabbitMQ?.host || userConfig.rabbitMQ?.host || 'localhost',
            port: kaserConfig?.rabbitMQ?.port || userConfig.rabbitMQ?.port || 5672,
            username: userConfig.rabbitMQ?.user || 'guest',
            password: userConfig.rabbitMQ?.password || 'guest',
            exchange: kaserConfig?.rabbitMQ?.exchange || userConfig.rabbitMQ?.exchange || 'kaser-exchange',
            routingKey: userConfig.rabbitMQ?.routingKey || `test.aliveSignal`,
            exchangeType: kaserConfig?.rabbitMQ?.exchangeType || userConfig.rabbitMQ?.exchangeType || 'topic',
        };
    }

    private startSender(serviceName: string, seconds: number, transport: Transport) {
        const interval = seconds * 1000;
        Logger.log(LoggingLevel.Info, `started with ${seconds} seconds interval`);

        transport
            .send(this.createAliveSignal(serviceName))
            .then(() => {
                Logger.log(LoggingLevel.Debug, `Alive Signal sent`);
            })
            .catch(reason => {
                Logger.log(LoggingLevel.Error, `could not send alive signal`, reason);
            });

        setInterval(() => {
            transport
                .send(this.createAliveSignal(serviceName))
                .then(() => {
                    Logger.log(LoggingLevel.Debug, `Alive Signal sent`);
                })
                .catch(reason => {
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
