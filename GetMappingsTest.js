"use strict";


const me = this;

const logger = require('./logger');
const utils = require('./utils');

const promise = utils.getAccessToken();

// マシン名とマッピングをする
promise.then((access_token) => {
    utils.GetMachineNameToLicenseKeyMappings(access_token)
        .then((obj) => {
            console.log("-- GetMachineNameToLicenseKeyMappings --");
            console.log(obj);
            console.log("-- GetMachineNameToLicenseKeyMappings --");
        });
});

promise.then((access_token) => {
    utils.getRobots(access_token).then((robotsInfo) => {
        const robots = robotsInfo.value;
        for (let i = 0; i < robots.length; i++) {
            utils.GetRobotMappings(robots[i].LicenseKey, robots[i].MachineName).then((robotMappings) => {
                console.log("-- GetRobotMappings --");
                console.log(robotMappings);
                console.log("-- GetRobotMappings --");
            });
        }
    });
});