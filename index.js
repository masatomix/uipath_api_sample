"use strict";


const me = this;

const logger = require('./logger');
const moment = require('moment');
const utils = require('./utils');
const util = require('util');


// https://orchestrator.uipath.com/v2017.1/reference

const promise = utils.getAccessToken();

// ロボットオブジェクト配列を返す、ロボットオブジェクトをID指定で取得、該当ロボットをUpdateする、サンプル。
promise.then((access_token) => {
    utils.getRobots(access_token).then((robotsInfo) => {
        console.log("-- getRobots --");
        const robots = robotsInfo.value;
        for (let i = 0; i < robots.length; i++) {
            console.log(robots[i]);
            console.log("-- getRobots --");

            // 下記のAPI
            // uri: servername + '/odata/Robots(' + id + ')',
            const id = robots[i].Id;
            utils.getRobot(access_token, id).then((robot) => {
                console.log("-- getRobot --");
                console.log(robot);
                console.log("-- getRobot --");
            });

            // Descのカラムを更新してみる
            let robot = robots[i];
            robot.Description = 'update: ' + moment().format("YYYY-MM-DD HH:mm:ssZ");
            utils.putRobot(access_token, robots[i]);


            utils.GetRobotMappings(robots[i].LicenseKey, robots[i].MachineName).then((robotMappings) => {
                console.log("-- GetRobotMappings --");
                console.log(robotMappings);
                console.log("-- GetRobotMappings --");
                for (let j = 0; j < robotMappings.length; j++) {
                    me.printAssociatedProcesses(robotMappings[j].robotKey);
                }
            });
        }
    });
});

module.exports.printAssociatedProcesses = (robotKey) => {
    utils.GetAssociatedProcesses(robotKey).then((processes) => {
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


// promise.then((access_token) => {
//     utils.GetConnectionData(access_token)
//         .then((obj) => {
//             console.log("-- GetConnectionData --");
//             console.log(obj);
//             console.log("-- GetConnectionData --");
//         });
// });