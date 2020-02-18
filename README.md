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
    useHttpTransport: true,
    useKasersConfig: false,
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
    useHttpTransport?: Boolean;
    serviceName: String;
    useKasersConfig?: Boolean;
}
```

When setting useKasersConfig to `true`, kaser-sender will ask kaser for its config, and use that config (while ignoring the local config)
If a specific parameter was not present in kaser's config, kaser-sender will use the value provided in the local one, or the default value.

When setting useKasersConfig to `false` (or not setting any value to it), kaser-sender will use the local config.

`useHttpTransport` will tell kaser-sender to use http transport, unless `useKasersConfig` was set to true.
