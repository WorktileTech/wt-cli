#!/usr/bin/env node
const child_process = require('child_process');
const path = require('path');
const pm2File = path.resolve(__dirname, '../node_modules/pm2/bin/pm2');

child_process.exec(`${pm2File} delete start-server`, function (err, stdout, stderror) {
    if (err) {
        return console.error(err);
    }
    stdout && console.log(stdout);
    stderror && console.log(stderror);
});