'use strict';
'use strict';
const cloudbase = require('@cloudbase/manager-node')
const app = cloudbase.init({
    envId: "test2-c94e9b" // 当前云开发环境ID，可在腾讯云云开发控制台获取
});

exports.main = async (event, context) => {
    const database = app.database;
    let {CollectionName} = event;
    let exportRes = await database.export(
        `${CollectionName}`,
        {
            ObjectKey: `${CollectionName}.json`
        });
 
    return {
        CollectionName,
        exportRes
    };
};
