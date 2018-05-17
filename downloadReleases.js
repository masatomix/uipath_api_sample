"use strict";


const me = this;

const logger = require('./logger');
const moment = require('moment');
const utils = require('./utils');
const util = require('util');


// https://orchestrator.uipath.com/v2017.1/reference

const promise = utils.getAccessToken();

promise.then((access_token) => {
    utils.getProcesses(access_token)
        .then((obj) => {

            console.log("-- getProcesses --");
            const releases = obj.value;
            let data = '';
            const header = util.format("%s\t%s\t%s\t%s\t%s",
                "PackageName", "Version", "ProcessName", "EnvironmentName", "Description");
            data += header;
            data += "\n";

            for (let i = 0; i < releases.length; i++) {
                const release = releases[i];
                const ProcessKey = release.ProcessKey;
                const ProcessVersion = release.ProcessVersion;
                const Name = release.Name;
                const EnvironmentName = release.EnvironmentName;
                const Description = release.Description;

                const message = util.format("%s\t%s\t%s\t%s\t%s",
                    ProcessKey, ProcessVersion, Name, EnvironmentName, Description);
                console.log(message);
                data += message;
                data += '\n';
            }
            console.log("-- getProcesses --");

            utils.writeFile("releases.tsv", data);
        });
});