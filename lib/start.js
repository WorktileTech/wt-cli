/*global require,__dirname*/
const program = require('commander');
const chalk = require('chalk');
const child_process = require('child_process');
const path = require('path');

program.on('--help', function () {
    console.log('  Examples:');
    console.log();
    console.log(chalk.yellow('    $ wt start -p [ port (default 7777) ]'));
    console.log();
    console.log();
});

program
    .version(require('../package').version)
    .usage('[port]')
    .option('-p --port [port]', 'Start server of port', parseInt)
    .parse(process.argv);

// require('./start-server')(program.port || 7777);
const pm2File = path.resolve(__dirname, '../node_modules/pm2/bin/pm2');
child_process.exec(`PORT=${program.port || 7777} ${pm2File} start ./lib/start-server.js`, function (err, stdout, stderror) {
    if (err) {
        return console.error(err);
    }
    stdout && console.log(stdout);
    stderror && console.log(stderror);
});