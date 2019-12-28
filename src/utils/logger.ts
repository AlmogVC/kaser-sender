export enum LoggingLevel {
    Debug = 'DEBUG',
    Info = 'INFO',
    Warning = 'WARNING',
    Error = 'ERROR',
}

export type AllowedLevels = { [key in LoggingLevel]?: boolean };

export class Logger {
    static allowedLevels: AllowedLevels;
    static printFullErrors: boolean;

    static setAllowedLevels(allowedLevels: AllowedLevels) {
        Logger.allowedLevels = allowedLevels;
    }

    static log(level: LoggingLevel, message: string, error?: any) {
        if (Logger.allowedLevels[level]) {
            console.log(`[Kaser Sender] ${level}: ${message}`);
            if (Logger.printFullErrors && error) console.log(error);
        }
    }
}
