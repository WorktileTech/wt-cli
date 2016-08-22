const fs = require('fs');
const path = require('path');

const getConfig = function () {
    try {
        var data = fs.readFileSync(path.resolve(__dirname, './config.json'));
        var jsonObj = JSON.parse(data);
        return jsonObj;
    } catch (err) {
        return {};
    }
};

const checkScriptsPath = function (scripts) {
    scripts.forEach(function (script) {
        const filePath = script.split(' ')[0];
        if (!fs.existsSync(filePath)) {
            throw new Error(`script file (${filePath}) is not exists.`)
        }
    });

};

module.exports = {
    getConfig  : getConfig,
    getVersion : function () {
        return getConfig().version;
    },
    getScripts : function () {
        const config = getConfig();
        //先执行此脚本 停止 docker 获取最新镜像
        const preScript = config.preScript;
        //最后执行此脚本  启动 docker 服务
        const postScript = config.postScript;
        //执行升级脚本,扫库等操作
        const upgradeScript = config.upgradeScript;
        //替换配置文件脚本
        const configScript = config.configScript;
        const scriptsRootDir = config.scriptsRootDir;
        const rootDir = scriptsRootDir.indexOf('/') === 0 ? scriptsRootDir : path.resolve(__dirname, scriptsRootDir);
        const result = {
            rootDir      : rootDir,
            preScript    : rootDir + preScript,
            upgradeScript: rootDir + upgradeScript,
            configScript : rootDir + configScript,
            postScript   : rootDir + postScript
        };
        console.log(result);
        checkScriptsPath([result.preScript, result.upgradeScript, result.configScript, result.postScript]);
        return result;
    },
    verifyToken: function (token) {
        return token === getConfig().token;
    }
};