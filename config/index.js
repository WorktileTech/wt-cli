const fs = require('fs');
const path = require('path');

var getConfig = function () {
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
        var preBashPath = getConfig().preScriptFilePath;
        var postBashPath = getConfig().postScriptFilePath;
        var result = {};
        if (preBashPath && fs.existsSync(preBashPath)) {
            result.preBashPath = preBashPath;
        }
        if (postBashPath && fs.existsSync(postBashPath)) {
            result.postBashPath = postBashPath;
        }
        return result;
    },
    verifyToken  : function (token) {
        return token === getConfig().token;
    }
};