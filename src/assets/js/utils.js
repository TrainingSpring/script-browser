const path = require("path");
const fs = require("fs");
/**
 * 向网页中写入css数据
 * @param {string} css
 */
function setStyle(css){

    let style = document.createElement('style')
    style.innerText = css;
    document.head.append(style);
}

/**
 * 向网页中插入js数据
 * @param {string} js
 */
function setScript(js){
    let script = document.createElement('script');
    script.type = "text/javascript";
    script.textContent = js;
    document.head.appendChild(script);
}


function getConfig(){
    let dir = path.join(__dirname, '../../../../config.json');
    let configStr = null;
    console.log(dir,",,,,,,,,,,,,,,,,,,,,,")
    if (fs.existsSync(dir)){
        configStr = fs.readFileSync(dir,'utf-8');
    }else{
        configStr = fs.readFileSync(path.join(__dirname,"config.json"),'utf-8');
        fs.writeFileSync(dir,configStr,'utf-8');
    }
    return JSON.parse(configStr);
}

module.exports = {
    setStyle,
    setScript,
    getConfig
}
