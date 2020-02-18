# Kaser Sender

This package sends Alive Signals with http or rabbitMQ-messages to the Kaser service.

## Usage

Exmple

```javascript
import * as KaserSender from 'kaser-sender';

KaserSender.start({
    kaserService: {
        hostname: 'localhost',
        port: 5001,
        protocol: 'https',
    },
    serviceName: 'test-service',
    interval: 60,
    intervalMargin: 5,
    useHttp: true,
    logger: {
        printFullErrors: true,
        allowedLevels: {
            DEBUG: true;
            INFO: true;
            WARNING: true;
            ERROR: true;
        },
    },
});
```

## Config

The config will be provided as a parameter to the init() function.

```javascript
{
    kaserService: {
        hostname: String;
        port: Number;
        protocol: 'http' | 'https';
    };
    rabbitMQ?: {
        user: String;
        password: String;
        host?: String;
        port?: number;
        exchange?: String;
        routingKey?: String;
        exchangeType?: String;
    };
    logger?: {
        printFullErrors?: Boolean;
        allowedLevels?: {
            DEBUG?: Boolean;
            INFO?: Boolean;
            WARNING?: Boolean;
            ERROR?: Boolean;
        };
    };
    interval?: Number;
    intervalMargin?: Number;
    useHttp?: Boolean;
    serviceName: String;
    useLocalConfig?: Boolean;
}
```
