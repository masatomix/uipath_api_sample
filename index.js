"use strict";


const me = this;

const logger = require('./logger');
const request = require('request');
const config = require('config');
const moment = require('moment');

module.exports.getAccessToken = () => {

    const userid = config.userinfo.UsernameOrEmailAddress;
    const password = config.userinfo.Password;
    const servername = config.serverinfo.servername;

    logger.main.info(userid);
    logger.main.info(password);
    logger.main.info(servername);

    const auth_options =
        {
            uri: 'https://' + servername + '/api/Account/Authenticate',
            // body: 'UsernameOrEmailAddress=' + userid + '&Password=' + password,
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
                resolve(access_token);
            }
        );

    });
    return promise;
};


const promise = me.getAccessToken();
promise.then(function (access_token) {
    logger.main.info(access_token);
    const servername = config.serverinfo.servername;


    const log_options =
        {
            uri: 'https://' + servername + '/odata/RobotLogs/UiPath.Server.Configuration.OData.Reports()',
            headers: {
                'Authorization': 'Bearer ' + access_token
            }
        };

    // ログインが成功したら。
    request.get(log_options,
        function (err, response, body) {
            if (err) {
                logger.main.error(err);
                return;
            }
            logger.main.info(body);
        }
    );


    const logs_options =
        {
            uri: 'https://' + servername + '/odata/RobotLogs',
            headers: {
                'Authorization': 'Bearer ' + access_token
            }
        };

    // ログインが成功したら。
    request.get(logs_options,
        function (err, response, body) {
            if (err) {
                logger.main.error(err);
                return;
            }
            logger.main.info(body);
            const obj = JSON.parse(body);
            const logs = obj.value;
            // console.log(robots);
            for (let index = 0; index < logs.length; index++) {

                const Level = logs[index].Level;
                const WindowsIdentity = logs[index].WindowsIdentity;
                const ProcessName = logs[index].ProcessName;
                const TimeStamp = logs[index].TimeStamp;
                const Message = logs[index].Message;
                const JobKey = logs[index].JobKey;
                const RawMessage = logs[index].RawMessage;

                const time_moment = moment(TimeStamp);
                const day = time_moment.format("YYYY/MM/DD");
                const time = time_moment.format("HH:mm:ss");

                console.log("%s\t%s\t%s\t%s\t%s\t%s", day, time, Level, WindowsIdentity, ProcessName, Message);
            }
        }
    );


    const auditlogs_options =
        {
            uri: 'https://' + servername + '/odata/AuditLogs',
            headers: {
                'Authorization': 'Bearer ' + access_token
            }
        };

    // ログインが成功したら。
    request.get(auditlogs_options,
        function (err, response, body) {
            if (err) {
                logger.main.error(err);
                return;
            }
            logger.main.info(body);
            const obj = JSON.parse(body);
            const logs = obj.value;
            // console.log(robots);
            for (let index = 0; index < logs.length; index++) {

                const ServiceName = logs[index].ServiceName;
                const MethodName = logs[index].MethodName;
                const Parameters = logs[index].Parameters;
                const Parameters_obj = JSON.parse(Parameters);
                const ExecutionTime = logs[index].ExecutionTime;
                const Id = logs[index].Id;

                const time_moment = moment(ExecutionTime);
                const day = time_moment.format("YYYY/MM/DD");
                const time = time_moment.format("HH:mm:ss");

                console.log("%s\t%s\t%s\t%s\t%s\t%s", day, time, ServiceName, MethodName, Id, Parameters);
                // console.log(Parameters_obj);
            }
        }
    );

}, function (error) {
    console.log(error);
    logger.main.error(error);
});
