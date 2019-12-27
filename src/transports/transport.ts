import { AliveSignal } from '../kaser.types';

export default abstract class Transport {
    abstract send(aliveSignal: AliveSignal): void;
}
