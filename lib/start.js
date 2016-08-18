var program = require('commander');
var chalk = require('chalk');

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

require('./start-server')(program.port || 7777);