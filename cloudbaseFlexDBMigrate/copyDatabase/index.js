'use strict';
const cloudbase = require('@cloudbase/manager-node')
const tcbNode = require('@cloudbase/node-sdk')
const request = require('request');
const app = cloudbase.init({
    envId: "test2-c94e9b" // 当前云开发环境ID，可在腾讯云云开发控制台获取
});
const newAppServer = tcbNode.init({
    env: "copy-test3-8gz3ncoya97e7161" // 迁移至的云开发环境ID，可在腾讯云云开发控制台获取
});
const database = app.database;
exports.main = async (event, context) => {
    const JobIdList = event.JobIdList;
   
    for (let index in JobIdList) {
        JobIdList[index].url = "";
        let migrateResult = await checkMigrateResult(JobIdList[index].result.exportRes.JobId);
        if (migrateResult.Status !== 'success') {
            console.log(`${JobIdList[index].result.CollectionName} ${migrateResult.ErrorMsg}`)
            //flag = false
            return `${JobIdList[index].result.CollectionName} Failed ${migrateResult.ErrorMsg})`;
        }else{
            console.log(`${JobIdList[index].result.CollectionName} ${migrateResult.ErrorMsg}`)
            JobIdList[index].url = migrateResult.FileUrl;
        }
    }

    for (let index in JobIdList) {
        let url = JobIdList[index].url;
        if(url == ""){
            continue;
        }
        let CollectionName = JobIdList[index].result.CollectionName
        let bf = await new Promise((resolve, reject) => {
            request(
                {
                    url: url,
                    encoding: null
                },
                function (error, response, buffer) {
                    resolve(buffer);
                })
        });
        const uploadResult = await newAppServer.uploadFile({
            cloudPath: `tmp/db-imports/${CollectionName}.json`,
            fileContent: bf
        })
        if (uploadResult.fileID != "") {
            const res = await newAppServer.callFunction({
                name: 'importDataBase',
                data: {
                    CollectionName: CollectionName,
                }
            })
            console.log(CollectionName, res);
        }
        if (index == JobIdList.length - 1) {
            return 'success';
        }
    }

};


async function checkMigrateResult(JobId) {
    let migrateResult = await database.migrateStatus(JobId)
    return migrateResult;
    
}