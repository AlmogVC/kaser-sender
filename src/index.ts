import KaserSender from './kaserSender';
import * as KaserTypes from './kaser.types';

export type KaserSenderConfig = KaserTypes.KaserSenderConfig;

let kaserSender: KaserSender;

export function init(config: KaserSenderConfig) {
    kaserSender = new KaserSender(config);
}

export function start() {
    if (kaserSender) kaserSender.start();
}
