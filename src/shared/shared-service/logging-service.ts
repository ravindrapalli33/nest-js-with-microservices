import * as split from 'split';
import { createLogger, transports, format } from 'winston';
import { version } from './../../../package.json';

const logger = createLogger({
    format: format.combine(
        format.colorize(),
        format.timestamp(),
        format.ms(),
        format.label({
            label: 'v' + version,
            message: true
        }),
        format.metadata(),
        format.simple()
    ),
    transports: [
        new transports.Console({
            level: 'info',
            handleExceptions: true
        })
    ],
    exitOnError: false
});

logger.stream = split().on('data', function (message: string) {
    logger.info(message);
});
export default logger;
