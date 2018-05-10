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


// ロボットログを取得する(JSONで落ちてくるので整形)
promise.then((access_token) => {
    const servername = config.serverinfo.servername;

    const logs_options =
        {
            uri: servername + '/odata/RobotLogs',
            headers: {
                'Authorization': 'Bearer ' + access_token
            },
            qs: {
                "$filter": "Level eq 'Info'"
            }
        };

    // ログインが成功したら。
    request.get(logs_options,
        function (err, response, body) {
            if (err) {
                logger.main.error(err);
                return;
            }
            const obj = JSON.parse(body);
            const logs = obj.value;

            logger.main.info('Robotログ: START.');
            let data = '';
            const header = util.format("%s\t%s\t%s\t%s\t%s\t%s\t%s\t%s\t%s\t%s\t%s\t%s\t%s\t%s\t%s\t%s",
                "TimeStamp", "day", "time", "YYYY", "MM", "DD", "HH", "mm", "ss", "JobKey", "Level", "WindowsIdentity", "RobotName", "ProcessName",
                "rawMessage.totalExecutionTimeInSeconds", "Message");
            data += header;
            data += "\n";
            for (let index = 0; index < logs.length; index++) {

                logger.main.info(JSON.stringify(logs[index]));

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
                const YYYY = time_moment.format("YYYY");
                const MM = time_moment.format("MM");
                const DD = time_moment.format("DD");
                const HH = time_moment.format("HH");
                const mm = time_moment.format("mm");
                const ss = time_moment.format("ss");


                const rawMessageObj = JSON.parse(RawMessage);
                if (rawMessageObj.hasOwnProperty('totalExecutionTimeInSeconds')) {
                    const message = util.format("%s\t%s\t%s\t%s\t%s\t%s\t%s\t%s\t%s\t%s\t%s\t%s\t%s\t%s\t%s\t%s",
                        TimeStamp, day, time, YYYY, MM, DD, HH, mm, ss, JobKey, Level, WindowsIdentity, RobotName, ProcessName,
                        rawMessageObj.totalExecutionTimeInSeconds, Message);
                    data += message;
                    data += '\n';
                }
            }
            logger.main.info('Robotログ: END.');


            utils.writeFile("RobotLogs03.tsv", data);
        }
    );

}, function (error) {
    console.log(error);
    logger.main.error(error);
});

