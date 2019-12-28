import KaserSender from './kaserSender';
import * as KaserTypes from './kaser.types';
import { Logger } from './utils/logger';

export type KaserSenderConfig = KaserTypes.KaserSenderConfig;

let kaserSender: KaserSender;

export function init(config: KaserSenderConfig) {
    Logger.setAllowedLevels(config.logger?.allowedLevels || { ERROR: true });
    Logger.printFullErrors = config.logger?.printFullErrors || false;

    kaserSender = new KaserSender(config);
}

export function start() {
    if (kaserSender) kaserSender.start();
}
