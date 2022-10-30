import winston from 'winston';

export const logger = winston.createLogger({
    level: 'info',
    transports: [
        new winston.transports.Console({ level: 'info' }),
        new winston.transports.Console({ level: 'error' }),
        new winston.transports.Console({ level: 'warn' }),
        new winston.transports.File({
            level: 'error',
            filename: './error.log',
        }),
        new winston.transports.File({ level: 'warn', filename: './warn.log' }),
    ],
});
