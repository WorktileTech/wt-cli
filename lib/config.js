#!/usr/bin/env node
const program = require('commander');
const path = require('path');
const chalk = require('chalk');

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
    .option('-s, --show', 'show config file path')
    .parse(process.argv);

// if(!program.args.length){
//     program.help();
// }

if (program.show) {
    console.log(path.resolve(__dirname, '../config/config.json'));
}
