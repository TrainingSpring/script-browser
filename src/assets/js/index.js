let {ipcRenderer} = require('electron');
const {inject} = require("../../pages/vue.global");
window.tools = {
    send: function (name, data) {
        ipcRenderer.send(name, data);
    },
    scripts:[
        {
            id:0,
            name:"双卫网",
            url:"http://sww.com.cn",
            urls:["http://sww.com.cn"],
            script:"sww.js"
        },
        {
            id:1,
            name:"鸿鹄GitLab",
            url:"http://172.17.10.202/educationadmin/fe",
            urls:["*://172.17.10.202*"],
            script:"hh-gitlab.js"
        }
    ],
    // 通配符转正则
    bracketToRegExp(str){
        str = str.replaceAll(".","\\.").replaceAll("*",".*").replaceAll("?","\\?");
        return new RegExp(`^${str}$`);
    },
    getScript(url){
        return this.scripts.find(item=>item.url===url);
    },
    getScriptId(url){
        return this.getScript(url)?.id;
    },
    injectScript(url){
        let item;
        for (let script of this.scripts){
            for (let iUrl of script.urls){
                let reg = tools.bracketToRegExp(iUrl);
                if (reg.test(url)){
                    item = script;
                }
            }
        }
        if (!item)return null;
        require("./"+item.script);

    },
}

tools.injectScript(location.href);
