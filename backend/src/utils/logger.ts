import winston from 'winston';

const isVercel = !!process.env.VERCEL;

const transports = isVercel
  ? [
      new winston.transports.Console(),
    ]
  : [
      new winston.transports.Console(),
      new winston.transports.File({
        filename: 'logs/error.log',
        level: 'error',
      }),
      new winston.transports.File({
        filename: 'logs/combined.log',
      }),
    ];

export const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',

  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),

  transports,
});