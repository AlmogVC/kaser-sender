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
    };
    rabbitMQ?: {
        user: string;
        password: string;
        host?: string;
        port?: string;
        exchange?: string;
        routingKey?: string;
        exchangeType?: string;
    };
    interval?: number;
    useHttp?: boolean;
}
