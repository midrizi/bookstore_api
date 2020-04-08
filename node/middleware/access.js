const path = require('path');
const fs = require('fs');
const rfs = require('rotating-file-stream');

// logging access in the same directory
const logDirectory = path.join(path.dirname(__dirname), 'logs');

// ensure logs directory exists
fs.existsSync(logDirectory) || fs.mkdirSync(logDirectory);

// create a rotating write stream
const accessLogStream = rfs.createStream('access.log', {
    // interval: '1d', // rotate daily
    path: logDirectory
});

module.exports = accessLogStream;