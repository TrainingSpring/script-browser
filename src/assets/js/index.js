const {ipcRenderer} = require("electron")

let u1 = "https://static-resource-1251756501.cos.ap-chengdu.myqcloud.com/other/back.png";
let u2 = "https://static-resource-1251756501.cos.ap-chengdu.myqcloud.com/other/refresh.png";
ipcRenderer.on("loaded",()=>{
    // 添加工具栏
    let bar = document.createElement("div");
    let body = document.body;
    let tools = `
    <img src="${u1}" alt="" style="width:20px;height:20px;margin-left: 20px;cursor: pointer;" onclick="history.back()">
    <img src="${u2}" alt="" style="width:20px;height:20px;margin-left: 20px;cursor: pointer;" onclick="history.go(0)">
    `
    document.querySelector(".headBox").style.top = "40px"
    body.style.paddingTop = "40px";
    bar.style.cssText = "position:fixed;" +
        "top:0;left:0;" +
        "width:100%;" +
        "height:40px;" +
        "display:flex;" +
        "align-items:center;" +
        "z-index:9999999999;" +
        "background:white;" +
        "box-sizing: border-box;" +
        "padding: 0 30px;" +
        "border-bottom:1px solid #eee;"

    bar.innerHTML = tools;
    body.append(bar);
    loaded()
})
// storage常量表
const constant = {
    list:"LIST",
    cur:"CURRENRT",
    pn:"PN",
    project_id:"PROJECT_ID",
    count:"COUNT"
};

/**
 * @desc 设置storage
 * @param {string} key
 * @param {any} value
 */
function setStorage(key, value) {
    if (value == null) value = "";
    else if (typeof value === 'object') value = JSON.stringify(value);
    localStorage.setItem(key, value);
}

/**
 * @desc 获取storage的内容
 * @param {string} key
 */
function getStorage(key) {
    let value = localStorage.getItem(key);
    try {
        return JSON.parse(value);
    } catch (e) {
        return value;
    }
}
// 列表页
const listUrl = "http://sww.com.cn/html/projectDetail";
// 详情页
const descUrl = "http://sww.com.cn/html/studyVideo";
const config = {
    url:{
        login:["http://sww.com.cn/","http://sww.com.cn/index"],
        list:listUrl,
        descUrl
    }
}
// 解析路由参数
function formatRouterParams(){
    let p_url = location.search.slice(1).split("&");
    let res = {};
    p_url.forEach(item=>{
        let s = item.split("=");
        res[s[0]] = s[1];
    })
    return res;
}
// 获取路由信息
function getRouterInfo(){
    let fullPath = location.origin + location.pathname;
    let params = formatRouterParams();
    return {
        fullPath,
        origin:location.origin,
        pathname:location.pathname,
        params
    }
}
// 获取url列表
function getUrlList(){
    // 详情页列表
    let list = [];
    let li = document.querySelectorAll(".kecheng-list ul li");
    if(li.length === 0)return null;
    li.forEach(item=>{
        let row = item.querySelector(".kecheng-list-r .kecheng-item-row");
        let url = row.querySelector("a").getAttribute('href');
        let state = row.innerText.indexOf("已学") > -1;
        if(!state) list.push(url);
    })
    return list;
}
function delay(time){
    return new Promise(resolve => setTimeout(()=>{resolve()},time))
}
async function loaded(){
    let route = getRouterInfo();
    let p = route.params;
    if (config.url.login.includes(route.fullPath)){
        login("15181813494","za094950")
    }
    await delay(500);
    // 列表页逻辑
    if(route.fullPath.indexOf(listUrl)>-1){
        let list = getUrlList();
        if(list == null)return;
        else if(list.length === 0)location.href = route.fullPath + "?pn="+(p.pn?Number(p.pn)+1:1)+"&project_id="+p.project_id;
        else{
            setStorage(constant.list,list);
            setStorage(constant.cur,0);
            setStorage(constant.pn,p.pn);
            setStorage(constant.project_id,p.project_id);
            location.href = route.origin + list[0];
        }
    }else if(route.fullPath.indexOf(descUrl)>-1){
        let elevideo = document.querySelector(".kejian-box .prism-player video");
        elevideo.muted = true;
        let jumpEle = document.querySelector(".memory-play-wrap");
        console.log("video: ",elevideo)
        console.log("jumpEle: ",jumpEle,jumpEle.children.length)
        console.log("jumpEle jump: ",jumpEle.querySelector(".play-jump"))
        console.log("video play: ",document.querySelector("#kejian-video .prism-big-play-btn"))
        if(jumpEle.children.length) jumpEle.querySelector(".play-jump").click();
        else document.querySelector("#kejian-video .prism-big-play-btn").click();

        setTimeout(() => {
            console.log("ended:",elevideo.ended)
            console.log("error:",elevideo.error)
            console.log("paused:",elevideo.paused)
            console.log("networkState:",elevideo.networkState)
            console.log("readyState:",elevideo.readyState)
            console.log("currentTime:",elevideo.currentTime)
        }, 2000);
        // 结束播放处理函数
        let playEndHandle = ()=>{
            let cur = Number(getStorage(constant.cur));
            let list = getStorage(constant.list);
            let n_cur = cur + 1;
            let count = sessionStorage.getItem(constant.count)||"0";
            count = Number(count);
            setStorage(constant.cur,n_cur);
            sessionStorage.setItem(constant.count, (++count).toString())
            if(list.length <= n_cur){
                let pn = Number(getStorage(constant.pn));
                let pid = getStorage(constant.project_id);
                location.href = listUrl+`?pn=${(pn+1)}&project_id=${pid}`;
            }else location.href= list[n_cur];
        }
        elevideo.addEventListener('loadeddata', function () {
            console.log("下载监听");
        });

        elevideo.addEventListener('loadedmetadata', function () {
            //视频总长度
            console.log(elevideo.duration);
        });

        elevideo.addEventListener('play', function () {
            console.log("开始播放");
        });

        elevideo.addEventListener('playing', function () {
            console.log("播放中");
        });

        elevideo.addEventListener('waiting', function () {
            console.log("加载中");
        });

        elevideo.addEventListener('pause', function (e) {
            console.log("暂停播放");
            let dt = e.target.duration; // 总时长
            let ct = e.target.currentTime; // 当前时长
            if(dt - ct > 10)return;
            playEndHandle();
        });

        elevideo.addEventListener('ended', function () {
            playEndHandle();
            console.log("播放结束");
        }, false);

        elevideo.addEventListener('error', function() {
            location.go(0);
            console.log("播放错误")
        })
    }
}

/**
 * @desc 登录
 */
function login(username, password){
    let noLogin = document.getElementById("nologin");
    // 未登录就登录
    if (noLogin){
        let mydialogId = document.getElementById("mydialogId");
        mydialogId.style.display='block';
        document.querySelector('.zhezhao').style.display='block';
        let loginBox = mydialogId.querySelector(".loginBox")
        let userId = document.getElementById("userId");
        let passId = document.getElementById("passId");
        let code = document.getElementById("vailmagid");
        setTimeout(()=>{code.focus();},1000)
        code.oninput = function () {
            // 验证码输入4个字符自动点击登录
            if (this.value.length === 4){
                loginBox.querySelector("button").click();
            }
        }
        userId.value = username;
        passId.value = password;
        userId.setAttribute('disabled','disabled')
    }else{
        // 登录了跳转到对应菜单
        document.querySelector(".mainNav a").click();
    }
}
