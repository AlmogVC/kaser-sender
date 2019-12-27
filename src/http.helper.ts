import * as http from 'http';
import * as querystring from 'querystring';

export function httpGet(hostname, port, apiPath): Promise<any> {
    return new Promise((resolve, reject) => {
        http.get(`http://${hostname}:${port}${apiPath}`, res => {
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

export function httpPost(hostname, port, path, body) {
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
