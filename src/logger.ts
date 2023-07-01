import {createLogger, format, info, transports} from 'winston';
import chalk, {level} from "chalk";
import {log} from "util";

export const logger = createLogger({
    level: 'info',
    transports: [
        new transports.Console({
            level: 'info',
            format: format.combine(
                format.colorize(),
                format.printf((info) => {
                    return chalk.whiteBright(`${info.message}`);
                }),
            ),
        }),
    ],
});