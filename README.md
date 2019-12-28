# Kaser Sender

This package sends Alive Signals with http or rabbitMQ-messages to the Kaser service.

## Usage

Exmple

```javascript
import * as KaserSender from 'kaser-sender';

KaserSender.init({
    kaserService: {
        hostname: 'localhost',
        port: 5001,
    },
    serviceName: 'test-service',
    interval: 10,
    intervalMargin: 2,
    useHttp: true,
    logger: {
        allowedLevels: {
            ERROR: true,
        },
    },
});

KaserSender.start();
```

## Config

The config will be provided as a parameter to the init() function.

```javascript
{
    kaserService: {
        hostname: String;
        port: Number;
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
