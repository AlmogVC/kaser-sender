import * as os from 'os';
import { KaserConfig, KaserSenderConfig } from './kaser.types';
import { RabbitTransportConfig, RabbitTransport } from './transports/rabbit.transport';
import Transport from './transports/transport';
import { HttpTransport, HttpTransportConfig } from './transports/http.transport';
import KaserService from './kaser.service';

const DEFAULT_INTERVAL = 60;
const DEFAULT_INTERVAL_MARGIN = 5;

start('test', { kaserService: { hostname: 'localhost', port: 5001 } });

async function start(serviceName: string, kaserSenderConfig: KaserSenderConfig) {
    const kaserService: KaserService = new KaserService(
        kaserSenderConfig.kaserService.hostname,
        kaserSenderConfig.kaserService.port,
    );

    const kaserConfig: KaserConfig = await kaserService.getConfig();
    const isRmqActive =
        kaserSenderConfig.useHttp !== undefined ? kaserSenderConfig.useHttp : kaserConfig.rabbitMQ.isActive;
    let transport: Transport<any>;

    if (isRmqActive) {
        const rabbitTransportConfig: RabbitTransportConfig = {
            host: kaserConfig.rabbitMQ.host,
            port: kaserConfig.rabbitMQ.port,
            username: 'guest',
            password: 'guest',
            exchange: kaserConfig.rabbitMQ.exchange,
            routingKey: `test.aliveSignal`,
            exchangeType: kaserConfig.rabbitMQ.exchangeType,
        };

        transport = new RabbitTransport(rabbitTransportConfig);

        await (transport as RabbitTransport).init();
        console.log('[Kaser Sender] RabbitMQ transport initialized');
    } else {
        const httpTransportConfig: HttpTransportConfig = {
            kaserService,
        };
        transport = new HttpTransport(httpTransportConfig);
        console.log('[Kaser Sender] HTTP transport initialized');
    }

    let interval = DEFAULT_INTERVAL;

    if (
        kaserConfig.service.maxSilenceTimeInSeconds &&
        typeof kaserConfig.service.maxSilenceTimeInSeconds === 'number'
    ) {
        interval = kaserConfig.service.maxSilenceTimeInSeconds;
    }

    startSender(serviceName, interval, transport);
}

function startSender(serviceName: string, seconds: number, transport: Transport<any>) {
    const interval = (seconds - DEFAULT_INTERVAL_MARGIN) * 1000;
    console.log(`[Kaser Sender] started with ${seconds} seconds interval`);

    transport.send(createAliveSignal(serviceName));

    setInterval(async () => {
        transport.send(createAliveSignal(serviceName));
    }, interval);
}

function createAliveSignal(serviceName: string) {
    return {
        hostname: os.hostname(),
        serviceName,
        aliveDate: new Date().toString(),
        upTimeInSeconds: process.uptime(),
    };
}
