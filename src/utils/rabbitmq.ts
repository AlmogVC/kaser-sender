import * as amqplib from 'amqplib';
import { LoggingLevel, Logger } from './logger';

let connection: amqplib.Connection;
let publishChannel: amqplib.Channel;

export async function connect(username: string, password: string, host: string, port: number) {
    connection = await amqplib.connect(`amqp://${username}:${password}@${host}:${port}`);

    connection.on('error', error => {
        Logger.log(LoggingLevel.Error, 'RabbitMQ connection error', error);

        process.exit(1);
    });

    connection.on('close', error => {
        if (process.env.NODE_ENV !== 'test') {
            Logger.log(LoggingLevel.Info, 'RabbitMQ connection close', error);

            process.exit(1);
        }
    });

    Logger.log(LoggingLevel.Info, `RabbitMQ connected on port ${port}`);

    return connection;
}

export function closeConnection() {
    if (connection) {
        return connection.close();
    }

    return Promise.resolve(null);
}

export async function publish(
    exchange: string,
    type: string,
    routingKey: string,
    message: Object,
    options?: amqplib.Options.Publish,
) {
    if (!publishChannel) {
        publishChannel = await connection.createChannel();

        publishChannel.on('error', error => {
            Logger.log(LoggingLevel.Warning, `RabbitMQ channel error`, error);

            process.exit(1);
        });

        publishChannel.on('close', error => {
            if (process.env.NODE_ENV !== 'test') {
                Logger.log(LoggingLevel.Info, `RabbitMQ channel close`, error);

                process.exit(1);
            }
        });

        await publishChannel.assertExchange(exchange, type, {
            durable: true,
        });
    }

    publishChannel.publish(exchange, routingKey, Buffer.from(JSON.stringify(message)), {
        persistent: true,
        ...options,
    });
}
