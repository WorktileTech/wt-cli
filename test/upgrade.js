const request = require('request');
const upgradeUrl = "http://localhost:7777/api/upgrade";

request.post(upgradeUrl, {
    headers: {
        'wt-docker-token': '7dd896fe-6da5-4e06-8cad-b1bab8e1cf8f'
    },
    json: {
        scripts: ['ls']
    }
}, function (err, resp, body) {
    console.log(body);
});