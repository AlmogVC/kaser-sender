import { AliveSignal } from '../kaser.types';

export default abstract class Transport<ConfigType extends {}> {
    config: ConfigType;

    constructor(config: ConfigType) {
        this.config = config;
    }

    abstract send(aliveSignal: AliveSignal): void;
}
