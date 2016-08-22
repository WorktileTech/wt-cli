const request = require('request');
const upgradeUrl = "http://localhost:7777/api/upgrade";

request.post(upgradeUrl, {
    headers: {
        'wt-docker-token': '7dd896fe-6da5-4e06-8cad-b1bab8e1cf8f'
    },
    json   : {
        'version'        : '2.2.3',
        'upgradeVersions': ['2.2.2'],
        'services'       : 'im box backend fetch.reminder web',
        'images'         : 'wtpro-im:v2.1.23 wtpro-web:v2.1.23',
    }
}, function (err, resp, body) {
    console.log(body);
});