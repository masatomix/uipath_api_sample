const logger = require('./logger');
const request = require('request');

const config = require('config');

const userid = config.userinfo.UsernameOrEmailAddress;
const password = config.userinfo.Password;
const servername = config.serverinfo.servername;

logger.main.info(userid);
logger.main.info(password);
logger.main.info(servername);


const auth_options =
    {
        uri: 'https://' + servername + '/api/Account/Authenticate',
        body: 'UsernameOrEmailAddress=' + userid + '&Password=' + password,
        headers: {
            'content-type': 'application/x-www-form-urlencoded'
        }
    };

// まずログイン
request.post(auth_options,
    function (err, response, body) {
        if (err) {
            return console.log(err);
        }
        // console.log(body);
        let obj = JSON.parse(body);
        let access_token = obj.result;

        let log_options =
            {
                uri: 'https://uipath.masatom.in/odata/RobotLogs/UiPath.Server.Configuration.OData.Reports()',
                headers: {
                    'Authorization': 'Bearer ' + access_token
                }
            };

        // ログインが成功したら。
        request.get(log_options,
            function (err, response, body) {
                if (err) {
                    return console.log(err);
                }
                console.log(body);
            }
        );
    }
);
