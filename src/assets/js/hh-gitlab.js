const $axios = require("../modules/axios/dist/browser/axios.cjs");
const path = require("path");
const fs = require("fs");
const tools = require("./tools.js");
const {setScript,setStyle,getConfig} = require("./utils")
const config = getConfig();
// import "../../pages/element-plus.css"
function login(){
    let cfg = config.hhGitLab;
    let id = document.getElementById("user_login");
    let pwd = document.getElementById("user_password");
    let remember = document.getElementById("user_remember_me");
    let button = document.querySelector(".submit-container .btn-confirm");
    id.value = cfg.username;
    pwd.value = cfg.password;
    remember.checked = true;
    button.click();
}


function setToolsBar(){
    let toolsBar = document.createElement("dev");
    toolsBar.id="tools-bar";
    // 仓库, 分支,功能按钮组
    toolsBar.innerHTML = `
    <div class="tools-bar-top" @click="visibleToolsBar(!visible)">
    <span v-show="visible">隐藏</span>
    <span v-show="!visible">展开</span>
    </div>
    <div class="tools-bar-lab" style="margin-bottom: 10px;">
        <el-select id="tools-bar-lab" v-model="lab" placeholder="请选择仓库" @change="changeLab">
            <el-option v-for="(item,index) in list.lab" :key="item.id" :label="item.name" :value="item.id"></el-option>
        </el-select>
    </div>
    <div class="tools-bar-branch">
        <el-select 
            @change="changeBranch"
            filterable
            reserve-keyword
            remote 
            id="tools-bar-branch" 
            v-model="branch" 
            placeholder="请选择分支"
            :remote-method="remoteMethod"
            >
            <el-option v-for="item in list.branch" :key="item" :label="item" :value="item"></el-option>
        </el-select>
    </div>
    <div class="tools-bar-function-list">
        <div class="function-title">合并</div>
        <el-input placeholder="标题" style="margin-bottom:10px;" v-model="mergeTitle"></el-input>
        <div class="button-group">
            <div class="btn-item" @click="merge('dev')" id="to-dev">开发</div>
            <div class="btn-item" @click="merge('test')" id="to-test">测试</div>
            <div class="btn-item" @click="merge('pre')" id="to-pre">预发</div>
            <div class="btn-item" @click="merge('master')" id="to-pro">生产</div>
        </div>
        <div class="function-title">标签</div>
        <el-input placeholder="Message" style="margin-bottom:10px;" v-model="tagMsg"></el-input>
        <div class="button-group">
            <div class="btn-item" id="tag-pre" @click="tag('pre','pre')">预发</div>
            <div class="btn-item" id="tag-pro" @click="tag('master','prod')">生产</div>
        </div>
    </div>
    
    `
    const axios = $axios.create({
        baseURL:config.hhGitLab.url, // 仓库地址
        maxRedirects:0
    })
    document.body.append(toolsBar); // 插入工具到页面
    // 插入css
    setStyle(fs.readFileSync(path.join(__dirname,"../../pages/element-plus.css"),"utf-8"));
    // vue
    let app = Vue.createApp({
        data(){
            let defaultData = tools.getStorage("tools-bar") || {};
            return {
                lab:null,
                branch:null,
                visible:defaultData.visible,
                list:{
                    lab:[],
                    branch:[]
                },
                // tag的信息
                tagMsg:"",
                // 合并的标题
                mergeTitle:""
            }
        },
        mounted() {
            this.getData();
            this.visibleToolsBar(this.visible);
            this.refreshMergePage();
        },
        methods:{
            // 通过id获取项目信息
            getItemById(list=[],id){
                if (id == null)return null;
                return list.find(item=>item.id===id);
            },
            // 设置缓存
            setCache(obj){
                let cache = tools.getStorage("tools-bar") || {};
                let res = Object.assign(cache,obj);
                tools.setStorage("tools-bar",res);
            },
            // 初始化数据获取
            getData(){
                let cache = tools.getStorage("tools-bar");
                if (cache) {
                    this.lab = cache.lab;
                    this.branch = cache.branch;
                }
                axios.get("groups/educationadmin/fe/-/children.json").then(res=>{
                    this.list.lab = res.data;
                    this.getBranch("",true);
                })
            },
            // 获取分支
            getBranch(str ="",init=false){
                if (this.lab == null)return;
                let item = this.getItemById(this.list.lab,this.lab);
                axios.get(item.relative_path+"/refs?sort=updated_desc&ref=master&search="+str).then(res=>{
                    this.list.branch = res.data.Branches;
                    if (init){
                        if(!res.data.Branches.find(item=>item===this.branch)){
                            this.branch = null;
                            this.changeBranch(null);
                        }
                    }
                })
            },
            // 分支改变
            changeBranch(e){
                this.setCache({
                    branch:e
                })
            },
            // 仓库改变
            changeLab(i){
                let item = this.getItemById(this.list.lab,i);
                this.setCache({
                    lab:item.id,
                    branch:"master"
                })
                this.branch = "master";
                this.getBranch();
            },
            // 搜索分支
            remoteMethod(e){
                this.getBranch(e);
            },
            // 展开/隐藏工具
            visibleToolsBar(visible){
                this.visible = visible;
                let bar = document.querySelector("#tools-bar");
                this.setCache({
                    visible:visible
                })
                bar.className = !this.visible?"tools-bar-hide":""
            },
            // 检查合并是否已经存在
            checkMerge(target_branch){
                let item = this.getItemById(this.list.lab,this.lab);
                return new Promise((resolve,reject) => {
                    axios.get(item.relative_path+"/-/merge_requests").then(res=>{
                        let dom = new DOMParser().parseFromString(res.data,"text/html");
                        let li = dom.querySelectorAll(".content-list.mr-list>li");
                        for (let i = 0;i<li.length;i++){
                            let child = li[i];
                            let sb = child.querySelector(".merge-request-title.title .merge-request-title-text a").text;
                            let tb = child.querySelector(".project-ref-path.has-tooltip a.ref-name").text.trim();
                            if (sb == this.branch && tb == target_branch){
                                resolve(true);
                                return;
                            }
                        }
                        resolve(false);
                    })
                })
            },
            // 合并
            merge(target_branch){
                if (this.lab == null){
                    this.$message.error("请选择仓库！");
                    return;
                }else if (this.branch == null) {
                    this.$message.error("请选择分支！");
                    return;
                }
                let item = this.getItemById(this.list.lab,this.lab);
                this.checkMerge(target_branch).then(res=>{
                    if (res) {
                        this.$message.error("合并请求已存在！");
                        return
                    }
                    // 准备合并
                    axios.get(item.relative_path+"/-/merge_requests/new",{
                        params:{
                            "merge_request[source_project_id]": item.id,
                            "merge_request[source_branch]": this.branch,
                            "merge_request[target_project_id]": item.id,
                            "merge_request[target_branch]": target_branch,
                        },
                        headers:{
                            "Content-Type": "text/html; charset=utf-8",
                        }
                    }).then(res=>{
                        let dom = new DOMParser().parseFromString(res.data,"text/html");
                        let authenticity_token = dom.querySelector("input[name='authenticity_token']").value;
                        let params = {
                            authenticity_token,
                            "merge_request[title]": this.mergeTitle || this.branch,
                            "merge_request_diff_head_sha": dom.querySelector("#merge_request_diff_head_sha").value,
                            "merge_request[description]": "",
                            "merge_request[assignee_ids][]": dom.querySelector("input[name='merge_request[assignee_ids][]']").value,
                            "merge_request[reviewer_ids][]": dom.querySelector("input[name='merge_request[reviewer_ids][]']").value,
                            "merge_request[label_ids][]": dom.querySelector("input[name='merge_request[label_ids][]']").value,
                            "merge_request[force_remove_source_branch]": "0",
                            "merge_request[squash]": "0",
                            "merge_request[lock_version]": dom.querySelector("input[name='merge_request[lock_version]']").value,
                            "merge_request[source_project_id]": dom.querySelector("input[name='merge_request[source_project_id]']").value,
                            "merge_request[source_branch]": dom.querySelector("input[name='merge_request[source_branch]']").value,
                            "merge_request[target_project_id]": dom.querySelector("input[name='merge_request[target_project_id]']").value,
                            "merge_request[target_branch]": dom.querySelector("input[name='merge_request[target_branch]']").value,
                        }

                        let data = new FormData();
                        for (let i in params){
                            let item = params[i];
                            data.append(i,item);
                        }
                        // 发起合并请求
                        axios.post(item.relative_path+"/-/merge_requests",data,{
                            maxRedirects:0
                        }).then(res=>{
                            location.href = res.request.responseURL;
                            this.$message.success("合并请求已发起！");
                        }).catch(err=>{
                            this.$message.error("[error] 发起合并请求出错!")
                        })
                    }).catch(err=>{
                        this.$message.error("[error] 获取合并请求页面出错!")
                    })
                })

            },
            // 刷新并合并页
            refreshMergePage(){
                if (/\/educationadmin\/fe\/school-system\/\-\/merge_requests\/\d{2,}$/.test(location.pathname)){
                    setTimeout(()=>{
                        let db = document.querySelector(".mr-widget-body button[data-testid=\"disabled-merge-button\"]");
                        let ct = document.querySelector(".mr-widget-body .media-body span.bold").innerText.trim().includes("冲突");
                        let ci = document.querySelector(".mr-widget-body .gl-display-flex svg[aria-label=\"status_success\"]");
                        if (db) {
                            if (ct){
                                this.$alert("存在冲突，请手动解决冲突后，再合并！","冲突",{
                                    type:"error",
                                })
                            } else if(ci){
                                this.$message.error({
                                    message:"无合并权限！",
                                    duration:3000
                                });
                            }else
                                setTimeout(() => {
                                    location.reload();
                                }, 3000);
                        }
                    },1000)
                }
            },
            // 获取tag名
            getTagName(alias){
                let item = this.getItemById(this.list.lab,this.lab);
                let date = new Date();
                let tagName = `tag_`+alias+'_'+this.lab+'_'+date.getFullYear()+this.numberAddZero(date.getMonth()+1)+this.numberAddZero(date.getDate())+'_v'
                // 通过遍历找可用tag名
                let eachName = (callback)=>{
                    for (let i = 1;i < 100 ;i ++){
                        let tn = tagName+i;
                        if(callback(tn))return tn;
                    }
                    return null;
                }
                return new Promise((resolve,reject) => {
                    axios.get(item.relative_path+"/-/tags").then(res=>{
                        let dom = new DOMParser().parseFromString(res.data,"text/html");
                        let li = dom.querySelectorAll("#content-body .tags ul.content-list>li");
                        let tn = eachName((tn)=>{
                            for (let i = 0;i<li.length;i++){
                                let child = li[i];
                                let name = child.querySelector("a.item-title").innerText.trim();
                                if (name === tn)return false;
                            }
                            return true;
                        })
                        resolve(tn);
                    })
                })
            },
            numberAddZero(num){
                if(num < 10)return "0"+num;
                else return num+"";
            },
            tag(target_branch,alias){
                if (this.lab == null){
                    this.$message.error("请选择仓库！");
                    return;
                }else if (this.branch == null) {
                    this.$message.error("请选择分支！");
                    return;
                }
                let item = this.getItemById(this.list.lab,this.lab);

                this.getTagName(alias).then((res)=>{
                    if (res == null) return  this.$message.error("[error] 获取tag name 出错!");
                    axios.get(item.relative_path+"/-/tags/new").then(domData=>{
                        let dom = new DOMParser().parseFromString(domData.data,"text/html");
                        let authenticity_token = dom.querySelector("input[name='authenticity_token']").value;
                        axios.post(item.relative_path+"/-/tags",{
                            "tag_name":res,
                            "tag_message":this.tagMsg,
                            "ref":target_branch,
                            authenticity_token
                        }).then(res=>{
                            this.$message.success("tag已创建！");
                        }).catch(err=>{
                            this.$message.error("[error] 创建tag出错!");
                        })
                    })
                }).catch(err=>{
                    console.error(err);
                    this.$message.error("[error] 获取合并请求页面出错!")
                })
            }
        }
    });
    app.use(ElementPlus);
    app.mount("#tools-bar");

}
function handle(ev){
    switch (location.pathname){
        case "/users/sign_in":
            login();
            break;
        default:
            setScript(fs.readFileSync(path.join(__dirname, "../../pages/vue.global.js"), "utf-8"));
            setScript(fs.readFileSync(path.join(__dirname, "../../pages/element-plus.js"), "utf-8"));
            setToolsBar();
            setToolsBarStyle();
            // if ()
            break;
    }
}

addEventListener('load',handle);

function setToolsBarStyle(){
    setStyle(`
#tools-bar{
    position:fixed;
    right:0;
    width:300px;
    top:40px;
    background:#638ff1;
    color:white;
    padding:10px;
    transition:all 0.5s;
    max-height:1000px;
    overflow:hidden;
    z-index:999;
}
.tools-bar-hide{
    max-height:54px !important;
    
}
.tools-bar-top:hover{
    background:#8e4da98a;
}
.tools-bar-top{
    height:34px;
    line-height:34px;
    text-align:right;
    cursor:pointer;
    margin-bottom:10px;
    padding-right:10px;
    transition: all 200ms;
}
.function-title{
    padding: 10px;
    text-align: center;
    border-bottom: 1px solid #eee;
    margin: 10px 0;
}
.button-group{
    display:grid;
    grid-template-columns: repeat(4,1fr);
    gap:10px;
}
.button-group .btn-item{
    padding:10px;
    font-size:14px;
    height:60px;
    line-height:40px;
    cursor:pointer;
    text-align:center;
    border-right: 1px solid #eee;
    border-bottom: 1px solid #eee;
}
.button-group .btn-item:hover{
    box-shadow: 2px 2px 2px 2px #4045b1;
    border-right:none;
    border-bottom:none;
}
`)
}
