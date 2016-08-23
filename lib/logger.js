/*global module,require*/
const winston = require('winston');
const path = require('path');
const fs = require('fs');
const logFileName = path.resolve(__dirname, '../logs/log.log');
const exceptionFilePath = path.resolve(__dirname, '../logs/exceptions.log')
const logger = new (winston.Logger)({
    transports: [
        new (winston.transports.Console)(),
        new (winston.transports.File)({
            filename: logFileName,
            level   : 'info',
            maxsize : 2 * 1024 * 1024,
            maxFiles: 2
        })
    ]
});

winston.handleExceptions(new winston.transports.File({
    filename: exceptionFilePath,
    level   : 'info',
    maxsize : 2 * 1024 * 1024,
    maxFiles: 2
}));
module.exports = logger;

logger.getLogFiles = function () {
    return new Promise(function (resolve) {
        const logDir = path.resolve(__dirname, '../logs');
        fs.readdir(logDir, function (err, files) {
            var result = [];
            files.forEach(function (filename) {
                if (filename.indexOf('.log') >= 0) {
                    result.push(filename);
                }
            });
            resolve(result);
        });
    });

};