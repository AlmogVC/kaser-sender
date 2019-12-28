import KaserSender from './kaserSender';
import * as KaserTypes from './kaser.types';
import { Logger } from './utils/logger';

export type KaserSenderConfig = KaserTypes.KaserSenderConfig;

let kaserSender: KaserSender;

export function start(userConfig: KaserSenderConfig) {
    Logger.setAllowedLevels(userConfig.logger?.allowedLevels || { ERROR: true });
    Logger.printFullErrors = userConfig.logger?.printFullErrors || false;

    kaserSender = new KaserSender();
    kaserSender.start(userConfig);
}
