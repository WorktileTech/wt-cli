/*global require,module,process*/

const koa = require('koa');
const app = koa();
const router = require('koa-router')();
const config = require('../config');
const child_process = require('child_process');
const json = require('koa-json');
const bodyParser = require('koa-bodyparser');
const co = require('co');
const foreach = require('generator-foreach');
const logger = require('./logger');
const send = require('koa-send');
const fs = require('fs');
const path = require('path');

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
        logger.info('%s %s - %s', this.method, this.url, ms);
    });

    let verifyTokenMiddleware = function*(next) {
        let token = this.headers['wt-docker-token'];
        if (config.verifyToken(token)) {
            return yield next;
        } else {
            this.body = {message: "token error"}
        }
    };

    /**
     * 执行Bash脚本,文件或者命令
     * @param path
     * @param isFile
     * @returns {Promise}
     */
    const exec = function (path, isFile = false) {
        return new Promise(function (resolve, reject) {
            let child = isFile ? child_process.execFile(path) : child_process.exec(path);
            var stdout = '', stderr = '';
            child.stdout.on('data', function (data) {
                logger.info('stdout: ' + data);
                stdout += data;
            });
            child.stderr.on('data', function (data) {
                logger.info('stdout: ' + data);
                stderr += data;
            });
            child.on('close', function (code) {
                logger.info('closing code: ' + code);
                if (code !== 0) {
                    reject({code: code, stdout: stdout, stderr: stderr, path: path});
                }
                resolve({code: code, stdout: stdout, stderr: stderr});
            });
        })
    };

    /**
     * 替换脚本的参数
     * @param script 脚本
     * @param arguments 参数
     */
    const replaceScriptArgs = function (script, arguments) {
        let result = script;
        for (let key in arguments) {
            result = result.replace(`{{${key}}}`, arguments[key]);
        }
        return result;
    };

    const startUpgrade = function*(scripts, images, services, versionFrom, upgradeVersions, registryUsername, registryPassword, config) {
        let bashResults = [];

        // 1. exec pre script
        const preScript = replaceScriptArgs(scripts.preScript, {
            images: images,
            registryUsername: registryUsername,
            registryPassword: registryPassword
        });
        bashResults.push(yield exec(preScript));

        // 2. exec config upgrade script ::TODO
        if (config && config.web && config.im) {
            const webConfigTempFilePath = path.resolve(__dirname, `../config/temp-config-web.js`);
            const imConfigTempFilePath = path.resolve(__dirname, `../config/temp-config-im.js`);
            const profileConfigTempFilePath = path.resolve(__dirname, `../config/temp-config-profile`);
            const licenseConfigTempFilePath = path.resolve(__dirname, `../config/temp-config-license`);
            const redisConfigTempFilePath = path.resolve(__dirname, `../config/temp-config-redis`);
            const nginxMainConfigTempFilePath = path.resolve(__dirname, `../config/temp-config-nginx-main`);
            const nginxIMConfigTempFilePath = path.resolve(__dirname, `../config/temp-config-nginx-im`);
            const nginxBoxConfigTempFilePath = path.resolve(__dirname, `../config/temp-config-nginx-box`);
            const nginxSeaweedConfigTempFilePath = path.resolve(__dirname, `../config/temp-config-nginx-seaweed`);
            const sslCertificateConfigTempFilePath = path.resolve(__dirname, `../config/temp-config-ssh-certificate`);
            const sslCertificateKeyConfigTempFilePath = path.resolve(__dirname, `../config/temp-config-ssh-certificate-key`);

            fs.writeFileSync(webConfigTempFilePath, config.web, 'utf-8');
            fs.writeFileSync(imConfigTempFilePath, config.im, 'utf-8');
            fs.writeFileSync(profileConfigTempFilePath, config.profile, 'utf-8');
            fs.writeFileSync(licenseConfigTempFilePath, config.license, 'utf-8');
            fs.writeFileSync(redisConfigTempFilePath, config.redis, 'utf-8');
            fs.writeFileSync(nginxMainConfigTempFilePath, config.nginx_main, 'utf-8');
            fs.writeFileSync(nginxIMConfigTempFilePath, config.nginx_im, 'utf-8');
            fs.writeFileSync(nginxBoxConfigTempFilePath, config.nginx_box, 'utf-8');
            fs.writeFileSync(nginxSeaweedConfigTempFilePath, config.nginx_seaweed, 'utf-8');
            fs.writeFileSync(sslCertificateConfigTempFilePath, config.ssl_certificate, 'utf-8');
            fs.writeFileSync(sslCertificateKeyConfigTempFilePath, config.ssl_certificate_key, 'utf-8');
            const configScript = replaceScriptArgs(scripts.configScript, {
                webConfigFilePath  : webConfigTempFilePath,
                imConfigFilePath: imConfigTempFilePath,
                profileConfigFilePath: profileConfigTempFilePath,
                licenseConfigFilePath: licenseConfigTempFilePath,
                redisConfigFilePath: redisConfigTempFilePath,
                nginxMainConfigFilePath: nginxMainConfigTempFilePath,
                nginxIMConfigFilePath: nginxIMConfigTempFilePath,
                nginxBoxConfigFilePath: nginxBoxConfigTempFilePath,
                nginxSeaweedConfigFilePath: nginxSeaweedConfigTempFilePath,
                sslCertificateConfigFilePath: sslCertificateConfigTempFilePath,
                sslCertificateKeyConfigFilePath: sslCertificateKeyConfigTempFilePath
            });
            yield exec(configScript);
            fs.unlinkSync(webConfigTempFilePath);
            fs.unlinkSync(imConfigTempFilePath);
            fs.unlinkSync(profileConfigTempFilePath);
            fs.unlinkSync(licenseConfigTempFilePath);
            fs.unlinkSync(redisConfigTempFilePath);
            fs.unlinkSync(nginxMainConfigTempFilePath);
            fs.unlinkSync(nginxIMConfigTempFilePath);
            fs.unlinkSync(nginxBoxConfigTempFilePath);
            fs.unlinkSync(nginxSeaweedConfigTempFilePath);
            fs.unlinkSync(sslCertificateConfigTempFilePath);
            fs.unlinkSync(sslCertificateKeyConfigTempFilePath);
        }

        // 3. exec upgrade script
        yield * foreach(upgradeVersions, function*(versionTo) {
            const script = replaceScriptArgs(scripts.upgradeScript, {
                versionFrom: versionFrom,
                versionTo: versionTo});
            bashResults.push(yield exec(script, false));
        });

        // 4. exec post script
        const postScript = replaceScriptArgs(scripts.postScript, {services: services});
        bashResults.push(yield exec(postScript));

        return bashResults;
    };

    /**
     * POST /api/upgrade
     * Body:{
     *    version:'2.1.23'
     *    upgradeVersions:['2.1.21'],
     *    services:"im box backend fetch.reminder web",
     *    images:"wtpro-im:v2.1.23 wtpro-web:v2.1.23"
     * }
     */
    router.post('/api/upgrade', verifyTokenMiddleware, function *(next) {
        const ctx = this;
        const body = this.request.body;
        const scripts = config.getScripts();
        try {
            if (!body.version || !body.upgradeVersions || !body.images || !body.services || !body.registryUsername || !body.registryPassword) {
                ctx.body = {message: 'Input arguments is invalid.'}
            } else {
                const _config = config.getConfig();

                //开始执行升级程序
                let bashResults = yield startUpgrade(scripts, body.images, body.services, _config.version, body.upgradeVersions, body.registryUsername, body.registryPassword, body.config);

                //修改配置文件的版本为最新版本
                _config.version = body.version;
                config.save(_config);
                ctx.body = {message: bashResults, code: 200};
            }

        } catch (err) {
            //TODO:回滚部署功能,需要记录上次部署的一些参数
            ctx.body = {message: err, code: 500};
        }
    });

    router.get('/logs/download', function *() {
        try {
            const fileNames = yield logger.getLogFiles();
            const path = require('path');
            const stream = require('stream');
            const fs = require('fs');
            this.body = {fileNames: fileNames};
        } catch (err) {
            logger.error(err);
            this.body = {message: err.message};
        }
    });

    router.get('*', function *(next) {
        this.body = {version: config.getConfig().version};
    });

    app
        .use(router.routes())
        .use(router.allowedMethods());

    app.listen(port);
    console.log(`Server listing on ${port}`)

};
