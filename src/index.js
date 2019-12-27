import http from 'http';
import os from 'os';
import { getConfig, sendAliveSignal } from './kaser.service.mjs';
import * as rabbitMQ from './rabbitmq.mjs';

const kaser = {
    hostname: 'localhost',
    port: 5001,
};

(async () => {
    const serviceName = 'test';
    await start(`http://${kaser.hostname}:${kaser.port}`, serviceName);

    const server = http.createServer((req, res) => {});
    server.listen(3001);
})();

async function start(kaserURL, serviceName) {
    const config = await getConfig(kaserURL);
    const isRmqActive = config.rabbitMQ.isActive;

    if (isRmqActive) {
        const { host, port } = config.rabbitMQ;
        const username = 'guest';
        const password = 'guest';

        // await rabbitMQ.connect(username, password, host, port);
    }

    const interval = config.service.maxSilenceTimeInSeconds;
    startSender(serviceName, interval);
}

function startSender(serviceName, seconds) {
    const interval = seconds * 1000;
    console.log(`[Kaser Sender] started with ${seconds} seconds interval`);
    setInterval(async () => {
        const alertSignal = createAlertSignal(serviceName);

        await sendAliveSignal(kaser.hostname, kaser.port, alertSignal);
    }, interval);
}

function createAlertSignal(serviceName) {
    return {
        hostname: os.hostname(),
        serviceName,
        aliveDate: new Date().toString(),
        upTimeInSeconds: process.uptime(),
    };
}
