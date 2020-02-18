import * as http from 'http';
import * as https from 'https';
import * as querystring from 'querystring';

export function httpGet(
    protocol: 'http' | 'https' = 'http',
    hostname: string,
    port: number,
    apiPath: string,
): Promise<any> {
    return new Promise((resolve, reject) => {
        getSelectedProtocol(protocol)
            .get(`${protocol}://${hostname}:${port}${apiPath}`, res => {
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
    });
}

export function httpPost(protocol: 'http' | 'https' = 'http', hostname: string, port: number, path: string, body: any) {
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
        const req = getSelectedProtocol(protocol)
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

function getSelectedProtocol(protocol: 'http' | 'https') {
    switch (protocol) {
        case 'http':
            return http;
        case 'https':
            return https;
        default:
            return http;
    }
}
