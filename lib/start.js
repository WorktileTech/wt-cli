/*global require,__dirname*/
const program = require('commander');
const chalk = require('chalk');
const child_process = require('child_process');
const path = require('path');

program.on('--help', function () {
    console.log('  Examples:');
    console.log();
    console.log(chalk.yellow('    $ wt start -p [ port (default 9004) ]'));
    console.log();
    console.log();
});

program
    .version(require('../package').version)
    .usage('[port]')
    .option('-p --port [port]', 'Start server of port', parseInt)
    .option('-n --node', 'use node start server, default use pm2')
    .parse(process.argv);

if(program.node){
    return require('./server')(program.port || 9004);
}else{
    const pm2File = path.resolve(__dirname, '../node_modules/pm2/bin/pm2');
    child_process.exec(`PORT=${program.port || 9004} ${pm2File} start ${__dirname}/start-server.js`, function (err, stdout, stderror) {
        if (err) {
            return console.error(err);
        }
        stdout && console.log(stdout);
        stderror && console.log(stderror);
    });
}
