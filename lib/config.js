#!/usr/bin/env node
const program = require('commander');
const path = require('path');
const chalk = require('chalk');
const config = require('../config');
/**
 * Usage.
 */

program.on('--help', function () {
    console.log('  Examples:');
    console.log();
    console.log(chalk.yellow('    $ wt config -s[--show]'));
    console.log();
    console.log();
});

program
    .option('-s, --show', 'show config')
    .option('-p, --path', 'show config file path')
    .parse(process.argv);

if (program.path) {
    console.log(chalk.yellow(path.resolve(__dirname, '../config/config.json')));
}
if (program.show) {
    console.log(chalk.yellow(JSON.stringify(config.getConfig(), null, 2)));
}