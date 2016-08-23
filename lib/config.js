const program = require('commander');
const path = require('path');
const chalk = require('chalk');
const config = require('../config');
const inquirer = require('inquirer');

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
    .option('-i, --init', 'init set config')
    .option('-s, --show', 'show config')
    .option('-p, --path', 'show config file path')
    .parse(process.argv);

if (program.init) {
    const _config = config.getConfig();
    const questions = [
        {
            type    : 'input',
            name    : 'version',
            message : 'What\'s current version',
            validate: function (value) {
                if (/^\d+\.\d+\.\d+$/i.test(value)) {
                    return true;
                }
                return 'Please enter a valid version';
            },
            default : function () {
                return _config.version;
            }
        },
        {
            type   : 'input',
            name   : 'rootDir',
            message: 'What\'s bash root dir',
            default: function () {
                return _config.scriptsRootDir.indexOf('/') === 0
                    ? _config.scriptsRootDir
                    : path.resolve(__dirname, _config.scriptsRootDir);
            }
        },
        {
            type   : 'input',
            name   : 'token',
            message: 'What\'s your customer token',
            default: function () {
                return _config.token;
            }
        },
        {
            type   : 'input',
            name   : 'dockerBaseHost',
            message: 'What\'s your worktile docker host',
            default: function () {
                return _config.dockerBaseHost;
            }
        }
    ];

    inquirer.prompt(questions).then(function (answers) {
        console.log(JSON.stringify(answers, null, '  '));
        inquirer.prompt([{
            type    : 'input',
            name    : 'sure',
            message : 'Is this ok? yes or no',
            validate: function (value) {
                if (value === 'yes' || value === 'no') {
                    return true;
                }
                return 'Please enter yes or not';
            }
        }]).then(function (sureAnswer) {
            if (sureAnswer.sure === 'yes') {
                _config.version = answers.version;
                _config.scriptsRootDir = answers.rootDir;
                _config.token = answers.token;
                _config.dockerBaseHost = answers.dockerBaseHost;
                config.save(_config);
            }
        });
    });
    return;
}

if (program.path) {
    console.log(chalk.yellow(path.resolve(__dirname, '../config/config.json')));
}
if (program.show) {
    console.log(chalk.yellow(JSON.stringify(config.getConfig(), null, 2)));
}