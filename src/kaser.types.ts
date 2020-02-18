import { AllowedLevels } from './utils/logger';

export interface KaserConfig {
    rabbitMQ: {
        isActive: boolean;
        exchange: string;
        exchangeType: string;
        host: string;
        port: number;
    };
    service: {
        maxSilenceTimeInSeconds: number;
    };
}

export interface AliveSignal {
    hostname: string;
    serviceName: string;
    aliveDate: string;
    upTimeInSeconds: number;
}

export interface KaserSenderConfig {
    kaserService: {
        hostname: string;
        port: number;
        protocol: 'http' | 'https';
    };
    rabbitMQ?: {
        user: string;
        password: string;
        host?: string;
        port?: number;
        exchange?: string;
        routingKey?: string;
        exchangeType?: string;
    };
    logger?: { allowedLevels?: AllowedLevels; printFullErrors?: boolean };
    interval?: number;
    intervalMargin?: number;
    useHttp?: boolean;
    serviceName: string;
    useLocalConfig?: boolean;
}
