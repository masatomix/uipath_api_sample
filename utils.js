"use strict";

const me = this;

const logger = require('./logger');
const request = require('request');
const config = require('config');


const fs = require('fs');
const iconv = require('iconv-lite');

// https://orchestrator.uipath.com/v2017.1/reference
// https://platform.uipath.com/swagger/ui/index#

// userid/passwordで認証し、アクセストークンを取得する
module.exports.getAccessToken = () => {

    // const tenancyName = config.userinfo.tenancyName;
    // const userid = config.userinfo.usernameOrEmailAddress;
    // const password = config.userinfo.password;
    const servername = config.serverinfo.servername;

    logger.main.info(config.userinfo.tenancyName);
    logger.main.info(config.userinfo.usernameOrEmailAddress);
    logger.main.info(config.userinfo.password);
    logger.main.info(servername);

    const auth_options =
        {
            // uri: servername + '/api/Account/Authenticate',
            uri: servername + '/api/Account',
            // headers: {
            //     'Content-Type': 'application/json',
            //     'Accept': 'application/json'
            // },
            // json: {
            //     "tenancyName": tenancyName,
            //     "usernameOrEmailAddress": userid,
            //     "password": password
            // }, // jsonで投げると、戻ってきたときのParseが不要になるのか。。。

            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Accept': 'application/json'
            },
            form: config.userinfo
        };

    const promise = new Promise((resolve, reject) => {
        request.post(auth_options,
            function (err, response, body) {
                if (err) {
                    reject(err);
                    return;
                }

                const obj = JSON.parse(body);
                // const obj = body;
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
// idは、getRobots(で /odata/Robotsで取得されるRobotデータ) のIdの値(0,1,2...など)
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
// licenseKey: /odata/Robotsで取得されるRobotデータの LicenseKey の値
// machineName: /odata/Robotsで取得されるRobotデータの MachineName の値
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

// 端末名とライセンスキーのマッピング(Keys/Values)を取得する
// 得られるValuesは、Robot画面で得られる「Key」の値
// (今のところ使い道がないかな)
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

// 指定したロボットに紐付いたProcess配列を返す。
// robotKey: GetRobotMappingsで得られるデータの、robotKeyの値
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

// 指定したロボットに紐付いたProcess配列を 表示する
// robotKey: GetRobotMappingsで得られるデータの、robotKeyの値
module.exports.printAssociatedProcesses = (robotKey) => {
    me.GetAssociatedProcesses(robotKey).then((processes) => {
        for (let i = 0; i < processes.length; i++) {
            console.log("-- GetAssociatedProcesses --");
            console.log(processes[i]);
            console.log('processName:', processes[i].processName);
            console.log('packageId:', processes[i].packageId);
            console.log('packageVersion:', processes[i].packageVersion);
            console.log("-- GetAssociatedProcesses --");
        }
    });
};


// リリースされているProcessの一覧を取得する。
module.exports.getProcesses = (access_token) => {
    const servername = config.serverinfo.servername;
    const options =
        {
            method: 'GET',
            uri: servername + '/odata/Releases',
            headers: {
                'Authorization': 'Bearer ' + access_token
            }
        };
    return me.createGetPromise(options);
};

// 指定したパッケージ名とバージョンのnupkgを取得する。
module.exports.getNupkg = (access_token, packageName, version) => {
    const servername = config.serverinfo.servername;
    const options =
        {
            method: 'GET',
            uri: servername + "/nuget/Feed/default/Packages(Id='" +
            encodeURIComponent(packageName) +
            "',Version='" +
            version +
            "')/Download",
            headers: {
                'Authorization': 'Bearer ' + access_token
            },
            encoding: null
        };

    request(options,
        function (err, response, body) {
            if (err) {
                reject(err);
                return;
            }
            logger.main.info(body);
            fs.writeFileSync(packageName + '.' + version + ".nupkg.zip", body, 'binary');
        }
    );

};


// 指定したURLへアクセスして、戻り電文のJSONデータをオブジェクト化して返す
// 実際はPromiseを返す。
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


// 指定したパスに、Shift_JISでファイル書き出し
module.exports.writeFile = (path, data) => {
    const encode = iconv.encode(data, 'shift_jis');

    fs.writeFile(path, encode, function (err) {
        if (err) {
            throw err;
        }
    });

    // fs.access(path, function (err) {
    //         if (err) {
    //             // ファイルがなかったら、すぐつくる
    //             if (err.code === 'ENOENT') {
    //                 fs.appendFile(path, encode, function (error1) {
    //                     if (error1) {
    //                         throw error1;
    //                     }
    //                 });
    //             }
    //         } else {
    //             // ファイルがあったら、削除して作る
    //             fs.unlink(path, (error) => {
    //                 fs.appendFile(path, encode, function (error1) {
    //                     if (error1) {
    //                         throw error1;
    //                     }
    //                 });
    //
    //             });
    //         }
    //     }
    // );

};
/////////  ココまでは概ね、サンプル作成済み

module.exports.getRobotLogs = (access_token) => {
    const servername = config.serverinfo.servername;
    const options =
        {
            uri: servername + '/odata/RobotLogs',
            headers: {
                'Authorization': 'Bearer ' + access_token
            },
            qs: {
                "$filter": "Level eq 'Info'"
            }
        };
    return me.createGetPromise(options);
};

module.exports.getAuditLogs = (access_token) => {
    const servername = config.serverinfo.servername;
    const options =
        {
            uri: servername + '/odata/AuditLogs',
            headers: {
                'Authorization': 'Bearer ' + access_token
            }
        };
    return me.createGetPromise(options);
};


module.exports.postLog = (access_token, logData) => {

    const servername = config.serverinfo.servername;
    const options =
        {
            method: "POST",
            uri: servername + '/api/logs',
            headers: {
                'Authorization': 'Bearer ' + access_token
            },
            json: logData

        };

    // ログインが成功したら。
    request(options,
        function (err, response, body) {
            if (err) {
                logger.main.error(err);
                return;
            }
            logger.main.info('/api/logs START.');
            logger.main.info('HTTP status:', response.statusCode);
            logger.main.info(logData);
            logger.main.info('/api/logs END.');

        }
    );
}


// module.exports.getReports = (access_token) => {
//     const servername = config.serverinfo.servername;
//     const options =
//         {
//             uri: servername + '/odata/RobotLogs/UiPath.Server.Configuration.OData.Reports()',
//             headers: {
//                 'Authorization': 'Bearer ' + access_token
//             }
//         };
//     return me.createGetPromise(options);
// };


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
