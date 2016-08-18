/*global require,module*/
const koa = require('koa');
const app = koa();
const router = require('koa-router')();
const config = require('../config');
const child_process = require('child_process');
const json = require('koa-json');
const bodyParser = require('koa-bodyparser');
const co = require('co');
const foreach = require('generator-foreach');

module.exports = function (port) {

    app.use(json());
    app.use(bodyParser());
    app.use(function *(next) {
        try {
            yield next;
        } catch (err) {
            this.status = err.status || 500;
            this.body = err.message;
            this.app.emit('error', err, this);
        }
    });
    app.use(function *(next) {
        var start = new Date;
        yield next;
        var ms = new Date - start;
        console.log('%s %s - %s', this.method, this.url, ms);
    });

    router.get('/api/version', function *(next) {
        this.body = {code: 200, version: config.getConfig().version};
    });

    let verifyTokenMiddleware = function*(next) {
        let token = this.headers['wt-docker-token'];
        if (config.verifyToken(token)) {
            return yield next;
        } else {
            this.body = {message: "token error"}
        }
    };

    let exec = function (path, isFile = true) {
        return new Promise(function (resolve) {
            let child = isFile ? child_process.execFile(path) : child_process.exec(path);
            var stdout = '', stderr = '';
            child.stdout.on('data', function (data) {
                console.log('stdout: ' + data);
                stdout += data;
            });
            child.stderr.on('data', function (data) {
                console.log('stdout: ' + data);
                stderr += data;
            });
            child.on('close', function (code) {
                console.log('closing code: ' + code);
                resolve({code: code, stdout: stdout, stderr: stderr});
            });
        })
    };

    router.post('/api/upgrade', verifyTokenMiddleware, function *(next) {
        let ctx = this;
        let path = config.getScriptPath();
        let bashResults = [];
        if (path.preBashPath || path.postBashPath) {
            if (path.preBashPath) {
                bashResults.push(yield exec(path.preBashPath));
            }
            yield * foreach(this.request.body.scripts, function*(script) {
                bashResults.push(yield exec(script, false));
            });
            if (path.postBashPath) {
                bashResults.push(yield exec(path.postBashPath));
            }
            ctx.body = {
                code       : 200,
                message    : 'ok',
                bashResults: bashResults
            };
        } else {
            this.body = {code: 200, message: "Script file is not exist."};
        }

    });

    app
        .use(router.routes())
        .use(router.allowedMethods());

    app.listen(port);
    console.log(`Server listing on ${port}`)

};