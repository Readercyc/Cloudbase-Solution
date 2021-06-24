'use strict';
const cloudbase = require('@cloudbase/manager-node')
const tcbNode = require('@cloudbase/node-sdk')
const app = cloudbase.init({
    envId: "test2-c94e9b" // 当前云开发环境ID，可在腾讯云云开发控制台获取
});
const appServer = tcbNode.init({
    env: "test2-c94e9b" // 当前云开发环境ID，可在腾讯云云开发控制台获取
});
const database = app.database;
exports.main = async (event, context) => {
    let result = await database.listCollections()
    let { Collections } = result
    let JobIdList = [];
    let todolist = [];
    let flag = false;
    for(let i in Collections){
       if(Collections[i].Count == 0){
           continue;
       }else{
           todolist.push(Collections[i]);
       }
    }
    for (let index in todolist) {
        let CollectionName = todolist[index].CollectionName;
        let res = await appServer.callFunction({
            name: 'exportDatabase',
            data: {
                CollectionName,
                index,
            }
        })
        JobIdList.push(res);
        for (var t = Date.now(); Date.now() - t <= 1000;);
    }
    for (var t = Date.now(); Date.now() - t <= 10000;);
    while(flag==false){
        let res = await appServer.callFunction({
            name: 'copyDatabase',
            data: {
                JobIdList:JobIdList
            }
        })
        console.log(res.result);
        if(res.result == 'success'){
            flag = true;
            break;
        }else{
          flag = false;
        }
    }
    
    if(flag){
        return 'success';
    }else{
        return 'fail';
    }
    
};

