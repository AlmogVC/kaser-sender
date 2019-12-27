import http from 'http';
import querystring from 'querystring';

export function getConfig(address) {
    return httpGet(`${address}/api/config`);
}

export function sendAliveSignal(hostname, port, aliveSignal) {
    return httpPost(hostname, port, '/api/aliveSignal', aliveSignal);
}

function httpGet(address) {
    return new Promise((resolve, reject) => {
        http.get(address, res => {
            let data = '';

            res.on('data', chunk => {
                data += chunk;
            });

            res.on('end', () => {
                return resolve(JSON.parse(data));
            });
        }).on('error', err => {
            return reject(err);
        });
    });
}

function httpPost(hostname, port, path, body) {
    const postData = querystring.stringify(body);
    const options = {
        hostname,
        port,
        path,
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': Buffer.byteLength(postData),
        },
    };

    return new Promise((resolve, reject) => {
        const req = http
            .request(options, res => {
                let data = '';

                res.on('data', chunk => {
                    data += chunk;
                });

                res.on('end', () => {
                    return resolve(JSON.parse(data));
                });
            })
            .on('error', err => {
                return reject(err);
            });

        req.write(postData);
        req.end();
    });
}
