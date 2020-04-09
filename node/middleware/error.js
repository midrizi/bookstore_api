const winston = require('winston');
const path = require('path');
const fs = require('fs');
const shelljs = require('shelljs');

const logDirectory = path.join(path.dirname(__dirname), 'logs', 'error.log');

// ensure logs directory exists
fs.existsSync(logDirectory) || shelljs.mkdir('-p', logDirectory);

const logger = winston.createLogger({
    format: winston.format.json(),
    transports: [
        //
        // - Write all logs error (and below) to `error.log`.
        //
        new winston.transports.File({ filename: logDirectory, level: 'error' }),
    ]
});

module.exports = logger;
