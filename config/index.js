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

module.exports = {
    getConfig    : getConfig,
    getVersion   : function () {
        return getConfig().version;
    },
    getScriptPath: function () {
        //先执行此脚本 停止 docker 获取最新镜像
        const preBashPath = getConfig().preScriptFilePath;
        //最后执行此脚本  启动 docker 服务
        const postBashPath = getConfig().postScriptFilePath;
        //执行升级脚本,扫库等操作
        const upgradeBashPath = getConfig().scriptFilePath;
        //替换配置文件脚本
        const configBashPath = getConfig().configScriptFilePath;
        const result = {};
        if (preBashPath && fs.existsSync(preBashPath)) {
            result.preBashPath = preBashPath;
        }
        if (postBashPath && fs.existsSync(postBashPath)) {
            result.postBashPath = postBashPath;
        }
        if (upgradeBashPath && fs.existsSync(upgradeBashPath)) {
            result.upgradeBashPath = upgradeBashPath;
        }
        if (configBashPath && fs.existsSync(configBashPath)) {
            result.configBashPath = configBashPath;
        }
        return result;
    },
    verifyToken  : function (token) {
        return token === getConfig().token;
    }
};