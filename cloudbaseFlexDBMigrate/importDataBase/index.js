'use strict';
const cloudbase = require('@cloudbase/manager-node')
const app = cloudbase.init({
  envId: "copy-test3-8gz3ncoya97e7161" // 迁移至的云开发环境ID，可在腾讯云云开发控制台获取
});
const database = app.database
exports.main = async (event, context) => {
    const result = await database.listCollections()
    const list = [];
    const { Collections } = result
    for (let collection in Collections) {
        list.push(Collections[collection].CollectionName)
    }
    if(list.indexOf(event.CollectionName)==-1){
         let createResult = await database.createCollection(event.CollectionName)
     }
     const CollectionName = event.CollectionName;

     let importResult = await database.import(
        CollectionName,
        {
            ObjectKey: `tmp/db-imports/${CollectionName}.json` //默认导入路径是tmp/db-imports
        },
        {
            FileType: "json",
            StopOnError: true,
            ConflictMode: 'upsert'
        }
    )
    const { JobId } = importResult
    console.log(JobId)
    let migrateResult = await database.migrateStatus(JobId)
    return migrateResult;
};
