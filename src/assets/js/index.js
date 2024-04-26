let {ipcRenderer} = require('electron');
let fs = require('fs');
let path = require('path');
let {getConfig} = require("./utils.js");
let config = getConfig();

let scripts = [];
for (let i in config){
    let item = config[i];
    item.id = i;
    scripts.push(item);
}
window.tools = {
    send: function (name, data) {
        ipcRenderer.send(name, data);
    },
    scripts,
    // 通配符转正则
    bracketToRegExp(str){
        str = str.replaceAll(".","\\.").replaceAll("*",".*").replaceAll("?","\\?");
        return new RegExp(`^${str}$`);
    },
    getScript(url){
        return this.scripts.find(item=>item.url===url);
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
