"use strict";


const me = this;

const logger = require('./logger');
const moment = require('moment');
const utils = require('./utils');
const config = require('config');
const request = require('request');
const util = require('util');


// https://orchestrator.uipath.com/v2017.1/reference

const promise = utils.getAccessToken();

// レポートを出力する(CSVぽくおとす)
promise.then((access_token) => {
    const servername = config.serverinfo.servername;
    const log_options =
        {
            uri: servername + '/odata/RobotLogs/UiPath.Server.Configuration.OData.Reports()',
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
            logger.main.info('Reportログ: START.');
            logger.main.info(body);
            logger.main.info('Reportログ: END.');

            utils.writeFile("Reports.csv", body);

        }
    );
});

// ロボットログを取得する(JSONで落ちてくるので整形)
promise.then((access_token) => {
    utils.getRobotLogs(access_token).then((obj) => {
        const logs = obj.value;
        logger.main.info('Robotログ: START.');
        let data = '';
        for (let index = 0; index < logs.length; index++) {

            const Level = logs[index].Level;
            const WindowsIdentity = logs[index].WindowsIdentity;
            const ProcessName = logs[index].ProcessName;
            const TimeStamp = logs[index].TimeStamp;
            const Message = logs[index].Message;
            const JobKey = logs[index].JobKey;
            const RawMessage = logs[index].RawMessage;
            const RobotName = logs[index].RobotName;
            const Id = logs[index].Id;

            const time_moment = moment(TimeStamp);
            const day = time_moment.format("YYYY/MM/DD");
            const time = time_moment.format("HH:mm:ss");

            const message = util.format("%s\t%s\t%s\t%s\t%s\t%s\t%s\t%s", day, time, JobKey, Level, WindowsIdentity, RobotName, ProcessName, Message);
            // logger.main.info(message);
            // console.log(RawMessage);

            data += message;
            data += '\n';
            // console.log("%s", JSON.stringify(logs[index]));
            // console.log(RawMessage);
        }
        logger.main.info('Robotログ: END.');
        utils.writeFile("RobotLogs.tsv", data);
    });


    utils.getAuditLogs(access_token).then((obj) => {
        const logs = obj.value;
        logger.main.info('Auditログ: START.');
        let data = '';
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

        logger.main.info('Auditログ: END.');
        // utils.writeFile("AuditLogs.tsv", data);
    });


}, function (error) {
    console.log(error);
    logger.main.error(error);
});

