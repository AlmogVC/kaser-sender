import * as amqplib from 'amqplib';
import { LoggingLevel, Logger } from './logger';

export default class RabbitMQ {
    connection: amqplib.Connection | undefined;
    publishChannel: amqplib.Channel | undefined;
    config: {
        username: string;
        password: string;
        host: string;
        port: number;
    };

    constructor(username: string, password: string, host: string, port: number) {
        this.config = { username, password, host, port };
    }

    async connect() {
        this.connection = await amqplib
            .connect(`amqp://${this.config.username}:${this.config.password}@${this.config.host}:${this.config.port}`)
            .catch(reason => {
                Logger.log(LoggingLevel.Warning, 'Could not connect to  RabbitMQ', reason);
                return undefined;
            });

        if (!this.connection) return Promise.reject(new Error('Could not connect to RabbitMQ'));

        this.connection.on('error', error => {
            this.connection = undefined;
            this.publishChannel = undefined;
            Logger.log(LoggingLevel.Warning, 'RabbitMQ connection error', error);
        });

        this.connection.on('close', error => {
            if (process.env.NODE_ENV !== 'test') {
                this.connection = undefined;
                this.publishChannel = undefined;
                Logger.log(LoggingLevel.Info, 'RabbitMQ connection close', error);
            }
        });

        Logger.log(LoggingLevel.Info, `RabbitMQ connected on port ${this.config.port}`);

        return this.connection;
    }

    closeConnection() {
        if (this.connection) {
            const connectionClose = this.connection.close();
            this.connection = undefined;
            this.publishChannel = undefined;
            return connectionClose;
        }

        return Promise.resolve(null);
    }

    async publish(
        exchange: string,
        type: string,
        routingKey: string,
        message: Object,
        options?: amqplib.Options.Publish,
    ) {
        if (!this.connection) {
            return Promise.reject(new Error('No rabbitMQ connection'));
        }

        if (!this.publishChannel) {
            this.publishChannel = await this.connection.createChannel();

            this.publishChannel.on('error', error => {
                Logger.log(LoggingLevel.Warning, `RabbitMQ channel error`, error);
            });

            this.publishChannel.on('close', error => {
                if (process.env.NODE_ENV !== 'test') {
                    Logger.log(LoggingLevel.Info, `RabbitMQ channel close`, error);
                }
            });

            await this.publishChannel.assertExchange(exchange, type, {
                durable: true,
            });
        }

        return this.publishChannel.publish(exchange, routingKey, Buffer.from(JSON.stringify(message)), {
            persistent: true,
            ...options,
        });
    }
}
