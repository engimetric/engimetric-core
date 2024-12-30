import pino from 'pino';

const isProduction = process.env.NODE_ENV === 'production';

const logger = pino({
    level: isProduction ? 'info' : 'debug',
    transport: isProduction
        ? undefined // Log directly in JSON for production
        : {
              target: 'pino-pretty', // Pretty print for local development
              options: { colorize: true },
          },
    base: {
        pid: process.pid,
        application: 'engimetric',
    },
    timestamp: pino.stdTimeFunctions.isoTime,
});

export default logger;
