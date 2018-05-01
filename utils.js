"use strict";

const me = this;

const logger = require('./logger');
const request = require('request');
const config = require('config');


// アクセストークンを取得する
module.exports.getAccessToken = () => {

    const userid = config.userinfo.UsernameOrEmailAddress;
    const password = config.userinfo.Password;
    const servername = config.serverinfo.servername;

    logger.main.info(userid);
    logger.main.info(password);
    logger.main.info(servername);

    const auth_options =
        {
            uri: servername + '/api/Account/Authenticate',
            headers: {
                'content-type': 'application/x-www-form-urlencoded'
            },
            form: {
                "UsernameOrEmailAddress": userid,
                "Password": password
            }
        };

    const promise = new Promise((resolve, reject) => {
        request.post(auth_options,
            function (err, response, body) {
                if (err) {
                    reject(err);
                    return;
                }

                const obj = JSON.parse(body);
                if (!obj.success) {
                    reject(obj);
                    return;
                }

                const access_token = obj.result;
                logger.main.info(access_token);
                resolve(access_token);
            }
        );

    });
    return promise;
};


// ロボットオブジェクト配列を返す
module.exports.getRobots = (access_token) => {
    const servername = config.serverinfo.servername;
    const options =
        {
            method: 'GET',
            uri: servername + '/odata/Robots',
            headers: {
                'Authorization': 'Bearer ' + access_token
            }
        };
    return me.createGetPromise(options);
};


// ロボットをID(0,1,2....)指定で指定して、返す
module.exports.getRobot = (access_token, id) => {
    const servername = config.serverinfo.servername;
    const options =
        {
            method: 'GET',
            uri: servername + '/odata/Robots(' + id + ')',
            headers: {
                'Authorization': 'Bearer ' + access_token
            }
        };
    return me.createGetPromise(options);
};

// ロボットをそのキーに基づいて編集する
module.exports.putRobot = (access_token, robot) => {
    const servername = config.serverinfo.servername;
    const options =
        {
            method: 'PUT',
            uri: servername + '/odata/Robots(' + robot.Id + ')',
            headers: {
                'Authorization': 'Bearer ' + access_token,
                'content-type': 'application/x-www-form-urlencoded'
            },
            form: robot
        };

    request(options,
        function (err, response, body) {
            if (err) {
                logger.main.error(err);
                return;
            }
            console.log("success!");
        }
    );
};

// 端末名とライセンスキーのマッピングを取得する
module.exports.GetMachineNameToLicenseKeyMappings = (access_token) => {

    const servername = config.serverinfo.servername;
    const options =
        {
            method: 'GET',
            uri: servername + '/odata/Robots/UiPath.Server.Configuration.OData.GetMachineNameToLicenseKeyMappings()',
            headers: {
                'Authorization': 'Bearer ' + access_token
            }
        };
    return me.createGetPromise(options);
};


// 端末名とライセンスキーのマッピングを取得する
module.exports.GetRobotMappings = (licenseKey, machineName) => {
    const servername = config.serverinfo.servername;
    const options =
        {
            method: 'GET',
            uri: servername + '/api/robotsservice/GetRobotMappings',
            qs: {
                'licenseKey': "'" + licenseKey + "'",
                'machineName': machineName
            }
        };
    return me.createGetPromise(options);
};


module.exports.GetAssociatedProcesses = (robotKey) => {
    const servername = config.serverinfo.servername;
    const options =
        {
            method: 'GET',
            uri: servername + '/api/RobotsService/',
            // uri: servername + '/api/RobotsService/GetAssociatedProcesses',
            headers: {
                'Authorization': 'UiRobot ' + robotKey
            },
            qs: {
                robotKey: robotKey
            }
        };

    const promise = new Promise((resolve, reject) => {
        request(options,
            function (err, response, body) {
                if (err) {
                    reject(err);
                    return;
                }
                logger.main.info(body);
                const obj = JSON.parse(body);
                resolve(obj);
            }
        );
    });
    return promise;
};


module.exports.createGetPromise = (options) => {
    // promiseを返す処理は毎回おなじ。Request処理して、コールバックで値を設定するPromiseを作って返すところを共通化
    const promise = new Promise((resolve, reject) => {
        request(options,
            function (err, response, body) {
                if (err) {
                    reject(err);
                    return;
                }
                logger.main.info(body);
                const obj = JSON.parse(body);
                resolve(obj);
            }
        );
    });
    return promise;
};
/////////  ココまでは概ね、サンプル作成済み


// API呼び出しで成功した実績はなし。
module.exports.GetConnectionData = (access_token) => {

    const servername = config.serverinfo.servername;
    const options =
        {
            method: 'GET',
            uri: servername + '/api/RobotsService/GetConnectionData',
            headers: {
                'Authorization': 'Bearer ' + access_token
            },
            qs: {
                tenantId: 1
            }

        };
    return me.createGetPromise(options);
};


const fs = require('fs');
const iconv = require('iconv-lite');

module.exports.writeFile = (path, data) => {
    const encode = iconv.encode(data, 'shift_jis');

    fs.appendFile(path, encode, function (err) {
        if (err) {
            throw err;
        }
    });
};

module.exports.deleteFile = (path) => {
    fs.access(path, function (err) {
            if (err) {
                // if (err.code === 'ENOENT') {
                //     console.log('not exists!!');
                // }
            } else {
                fs.unlinkSync(path);
            }
        }
    );
};

