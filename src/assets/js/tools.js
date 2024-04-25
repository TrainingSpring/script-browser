
/**
 * @description 获取页面的分页相关信息
 * @param headers 从请求中获取到的headers
 * @return {object} page : 当前页码 , pageCount: 总页数 , pageSize: 每页数据量 , total 总数据量
 *
 */
function getPaginationInfo(headers = error()) {
  let [page, pageCount, pageSize, total] = [headers["x-pagination-current-page"], headers["x-pagination-page-count"], headers["x-pagination-per-page"], headers["x-pagination-total-count"]];
  return {
    page: parseInt(page),
    pageCount: parseInt(pageCount),
    pageSize: parseInt(pageSize),
    total: parseInt(total),
  }
}

/**
 * @desc 格式化时间
 * @Author Training
 * @param {string} fmt
 * @return {string}
 */
Date.prototype.Format = function (fmt = "yyyy-MM-dd hh:mm:ss") { // author: meizz
  let o = {
    "M+": this.getMonth() + 1, // 月份
    "d+": this.getDate(), // 日
    "h+": this.getHours(), // 小时
    "m+": this.getMinutes(), // 分
    "s+": this.getSeconds(), // 秒
    "q+": Math.floor((this.getMonth() + 3) / 3), // 季度
    "S": this.getMilliseconds() // 毫秒
  };
  if (/(y+)/.test(fmt))
    fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
  for (let k in o)
    if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : ((
      "00" + o[k]).substr(("" + o[k]).length)));
  return fmt;
}

function arrItemToString(arr) {
  return arr.map(item => item + "");
}
/**
 * 参数为空错误警告
 * @param {string} paramName 参数名
 */
function error(paramName) {
  throw new Error("参数" + paramName + "不允许为空");
}

/**
 * @description 防抖函数
 * @param {function} fn 执行函数
 * @param {boolean} after 是否后执行(若用户多次点击 在多次点击后才执行fn, 如果为false则在用户点击时即开始执行fn, 后续点击不做操作);
 * @param {number} delay 延迟时间
 * */
function debounce(fn, after, delay) {
  after = !!after;
  delay = delay || 500;
  let timer = null;
  let flag = false; // 是否已经执行函数;
  return function () {
    if (!after)
      if (flag) clearInterval(timer);
      else {
        fn.apply(this,arguments);
        flag = true;
      }
    else if (after && timer) clearInterval(timer);
    timer = setTimeout( ()=> {
      if (after) fn.apply(this,arguments);
      else flag = false;
    }, delay)
  }
}

/**
 * @description 节流
 * @param {function} fn 执行函数
 * @param {boolean} after 是否后执行
 * @param {number} delay 延时事件
 * @returns {(function(): void)|*}
 */
function throttle(fn, after, delay) {
  after = !!after;
  delay = delay || 500;
  let flag = false;
  let timer = null;
  return function () {
    if (flag === false) {
      if (!after) fn();
      flag = true;
    }
    if (!timer) {
      timer = setTimeout(function () {
        if (after) fn();
        flag = false;
        clearInterval(timer);
        timer = null;
      }, delay);
    }

  }
}

/** 格式化钱 */
function formatMoney(num) {
  let ts = num.toString(); // num to string -> ts
  let ta = (ts.indexOf(".") !== -1) ? ts.split('.') : [ts]; // num to array -> ta
  if (ta.length > 2) {
    return new Error("您输入的数据错误")
  } else {
    if (ta.length === 1) {
      return ta[0] + ".00"
    } else {
      if (ta[1].length === 1) {
        return ta[0] + "." + ta[1] + "0";
      } else {
        return num;
      }
    }
  }
}

function formatNumber(num) {
  let ts = num.toString(); // num to string -> ts
  let ta = (ts.indexOf(".") !== -1) ? ts.split('.') : [ts]; // num to array -> ta
  if (ta.length > 2) {
    return new Error("您输入的数据错误")
  } else {
    if (ta.length === 1) {
      return ta[0] + ".0"
    } else {
      return num;
    }
  }
}

/**
 * @desc 检查版本更新
 */
function checkVersionUpdate(currentVersion, serverVersion) {
  if (!serverVersion) return;
  // 判断是否有更新版本
  let current = currentVersion.split('.');
  let server = serverVersion.split('.');
  let have_new = false;
  for (let i = 0; i < 3; i++) {
    if (parseInt(current[i]) < parseInt(server[i])) {
      have_new = true;
      break;
    } else if (parseInt(current[i]) > parseInt(server[i])) {
      have_new = false;
      break;
    }
  }
  return have_new;
}

/**
 * @param {data:String(身份证号码),type:Number(加密类型: 0 身份证, 1 名字)}
 * @description 加密名字和身份证号码
 * @return {String}
 */
function secretId(data, type = 0) {
  let id = data + "";
  let format = "";
  for (let i = 0, len = id.length; i < len; i++) {
    if (type === 0) {
      if (i > 4 && i < len - 4) {
        format += "*"
      } else {
        format += id[i];
      }
    } else {
      if (i < len - 1) format += "*";
      else format += id[i];
    }
  }
  return format;
}

/**
 * @description 检测输入框内容正确与否
 * @param {string} type
 * @param {string|number} data
 *        type:
 *            empty: 输入的内容是否为空
 *            number: 输入数据是否为数字(或者小数)
 *            phone : 输入数据与电话号码匹配
 *            email : 输入数据是否为邮箱
 *            id      : 输入数据  身份证
 *            bank  : 输入数据是否为银行卡号
 *            chinese: 匹配中文
 *        data: 数据
 * */
function checkInput(type, data) {
  let reg = false;
  switch (type) {
    case "number":
      reg = /^[0-9\.\-]+$/
      break;
    case "phone":
      reg = /^1[1,3,4,5,6,7,8,9][0-9]{9}$/
      break;
    case "email":
      reg = /[\w!#$%&'*+/=?^_`{|}~-]+(?:\.[\w!#$%&'*+/=?^_`{|}~-]+)*@(?:[\w](?:[\w-]*[\w])?\.)+[\w](?:[\w-]*[\w])?/
      break;
    case "id":
      reg = /^(\d{6}|\d{3})(\d{4})(\d{2})(\d{2})(\d{3})([0-9]|[X]){1}$/
      break;
    case "bank":
      reg = /^([1-9]{1})(\d{16}|\d{15}|\d{18})$/
      break;
    case "qq":
      reg = /^[1-9][0-9]{4,9}$/
      break;
    case "chinese":
      reg = /^[^\x00-\xff]+$/
      break;
    case "empty":
      if (data == null) return true;
      reg = /^\s*$/
      break;
  }

  return reg && reg.test(data);
}
/**
 *
 * @param {Array |string} val 验证的值
 * @param {"&&" | "||"} reg 验证方式
 *        &&  验证数组val中的值是否全为空数据
 *        ||  验证数组val中的值是否有空数据
 * @return {boolean}
 */
const isEmpty = (val,reg="&&")=>{
  if (Array.isArray(val)){
    let flag = false;
    for (let item of val){
      if (reg === "&&" && item != null && item !== "")return false;
      else if(reg === "||" &&(item == null || item === "")) return true;
    }
    return reg === "&&";
  }else return val == null || val === "";
};
/**
 * @description 批量验证表单数据
 * @param {array} options
 *    [{
 *        type:"", // 类型
 *        data:"" // 数据
 *    }]
 * @param {function} callback
 */
function checkInputs(options, callback) {
  try {
    options.forEach(item => {
          callback(item, checkInput(item.type, item.data))
    })
  } catch (e) {

  }
}
/**
 * @param {number} nums: 毫秒数
 * @param {function} callback: 回调
 * 倒计时
 * */

function count_down(nums, callback) {
  if (!callback) callback = function () {};
  let hours = Math.floor(nums / (3600000)); // 时
  let min = Math.floor((nums - hours * 3600000) / 60000) // 分
  let sec = Math.floor((nums - hours * 3600000 - min * 60000) / 1000) // 秒
  let timer = setInterval(function () {
    sec--;
    if (sec < 0) {
      min--;
      if (min < 0) {
        hours--;
        if (hours < 0) {
          clearInterval(timer);
          hours = 0;
          min = 0;
          sec = 0;
          callback(timer, [hours, min, sec])
          return
        }
        min = 59;
      }
      sec = 59;
    }
    callback(timer, [hours, min, sec])
  }, 1000)

}

//判断图片是否存在
function CheckImgExists(imgurl, callback) {
  let ImgObj = new Image(); //判断图片是否存在
  ImgObj.src = imgurl;
  ImgObj.onload = function (e) {
    //存在图片
    if (ImgObj.width > 0 && ImgObj.height > 0) {
      callback(true);
    } else {
      callback(false);
    }
  }
  ImgObj.onerror = function (e) {
    callback(false);
  }
}

/**
 * @desc 设置storage
 * @param {string} key
 * @param {any} value
 */
function setStorage(key, value) {
  let storageKeys = getStorage("SESSION_KEYS") || [];
  if (value == null) {
    let index = storageKeys.indexOf(key);
    if (index > -1)
      storageKeys.splice(index,1);
    localStorage.removeItem(key);
  }
  else if (typeof value === 'object') value = JSON.stringify(value);
  if (!storageKeys.includes(key) && value != null) {
    storageKeys.push(key)
  }
  if (value != null)
    localStorage.setItem(key, value);
  localStorage.setItem("SESSION_KEYS", JSON.stringify(storageKeys))
}

/**
 * @desc 获取storage的内容
 * @param {string} key
 */
function getStorage(key) {
  let value = localStorage.getItem(key);

  try {
    let res = JSON.parse(value);
    if (typeof res === "number")
      return value;
    return res;
  } catch (e) {
    return value;
  }
}

function GUID(format = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx") {
  let char = ['A', 'B', 'C', 'D', 'E', 'F', 1, 2, 3, 4, 5, 6, 7, 8, 9, 0];
  let len = 0;
  for (let i in format)
    if (format[i] === 'x') len += 1;
  let random = () => {
    let i = parseInt(Math.random() * 15);
    return char[i];
  };
  return format.replace(/x/g, res => random())
}

/**
 * 判断时间是否在区间内
 * beginTime: 开始时间
 * endTime：结束时间
 * nowTime：现在的时间
 */
function contrastTime(beginTime, endTime, nowTime) {
  let strb = beginTime.split(":");

  let stre = endTime.split(":");

  let strn = nowTime.split(":");
  if (strn[0] >= strb[0] && strn[0] < stre[0]) {
    return true
  } else {
    return false
  }
}

/**
 * @desc 设置SessionStorage
 * @param {string} key
 * @param {any} value
 */
function setSession(key, value) {
  let sessionKeys = getSession("SESSION_KEYS") || [];
  if (value == null) {
    let index = sessionKeys.indexOf(key);
    if (index > -1)
    sessionKeys.splice(index,1);
    sessionStorage.removeItem(key);
  }
  else if (typeof value === 'object') value = JSON.stringify(value);
  if (!sessionKeys.includes(key) && value != null) {
    sessionKeys.push(key)
  }
  if (value != null)
    sessionStorage.setItem(key, value);
  sessionStorage.setItem("SESSION_KEYS", JSON.stringify(sessionKeys))
}

/**
 * @desc 获取SessionStorage的内容
 * @param {string} key
 */
function getSession(key) {
  let value = sessionStorage.getItem(key);
  try {
    return JSON.parse(value);
  } catch (e) {
    return value;
  }
}

/**
 * @description 获取json数据的最底层对象
 * @param obj
 * @param childName
 */
function getObjectLowerList(obj = error("object"), childName = "child") {
  let temp = [];
  let getList = (obj) => {
    if (Array.isArray(obj)) {
      if (obj.length === 0) return;
      for (let i = 0; i < obj.length; i++) {
        let item = obj[i];
        getList(item);
      }
    } else if (typeof obj === "object") {
      if (obj[childName] == null) {
        temp.push(obj);
      } else {
        getList(obj[childName]);
      }
    }
  }
  getList(obj, childName)
  return temp;
}

/**
 * @description 获取浏览器内核
 * @return {{name:string, version: string}}
 * @constructor
 */
function GetBrowser() {
  let Sys = {},
    ua = navigator.userAgent.toLowerCase(),
    s;
  (s = ua.match(/msie ([\d.]+)/)) ? Sys.ie = s[1]:

    (s = ua.match(/(trident)\/([\d.]+)/)) ? Sys.ie = s[2] :

    (s = ua.match(/firefox\/([\d.]+)/)) ? Sys.firefox = s[1] :

    (s = ua.match(/chrome\/([\d.]+)/)) ? Sys.chrome = s[1] :

    (s = ua.match(/opera.([\d.]+)/)) ? Sys.opera = s[1] :

    (s = ua.match(/version\/([\d.]+).*safari/)) ? Sys.safari = s[1] : 0;

  //以下进行测试
  let appName, appVersion;

  if (Sys.ie) {
    appName = "IE";
    appVersion = Sys.ie;
  }

  if (Sys.firefox) {
    appName = "Firefox";
    appVersion = Sys.firefox;
  }

  if (Sys.chrome) {
    appName = "Chrome";
    appVersion = Sys.chrome;
  }

  if (Sys.opera) {
    appName = "Opera";
    appVersion = Sys.opera;
  }

  if (Sys.safari) {
    appName = "Safari";
    appVersion = Sys.safari;
  }
  return {
    "name": appName,
    "version": appVersion
  };
}

/**
 * @description 深度优先遍历选择框组树
 * @param {JSON|Array}node  数据节点
 * @param {Object}options {
 *     child  子节点名 , 默认data
 *     selected 是否选中
 *     isFirst 第一次遍历
 * }
 * @return {*}
 */
function eachCheckboxTree(node, options = {}) {
  let _options = Object.assign({}, {
    child: "data",
    selected: null,
    isFirst: false
  }, options);
  let {
    child,
    selected,
    isFirst
  } = _options;
  let nodes = [];
  if (!!node) {
    let stack = [];
    if (Array.isArray(node)) {
      for (let i = node.length - 1; i >= 0; i--) {
        let item = node[i];
        if (isFirst) {
          let children = item[child] || [];
          item.tier = 0;
          // item.index = i;
          item.ground = children.length === 0;
        }
        stack.push(item);
      }
    } else if (typeof node === "object") {
      if (isFirst) {
        node.tier = 0;
        let children = node[child] || [];
        node.ground = children.length === 0;
      }
      stack.push(node);
    }
    while (stack.length > 0) {
      let item = stack.pop();
      nodes.push(item);
      let children = item[child] || [];
      let ground = false;
      let tier = item.tier;
      if (selected != null)
        item.selected = selected;
      if (isFirst) {
        tier++;
        ground = children.length === 0;
      }

      for (let i = children.length - 1; i >= 0; i--) {
        let c = children[i];
        if (isFirst) {
          c.ground = ground;
          c.parent = item;
          c.tier = tier;
          // c.index = i;
        }
        stack.push(c);
      }
    }
  }
  return node;
}

/**
 * @description  操作多选框组
 * @param item 当前操作的数据
 * @param indexes 下标组 以逗号隔开
 */
function handleCheckedGroup(item, childName, indexes) {
  let checked = item.selected;
  item = eachCheckboxTree(item, {
    selected: checked,
    child: childName
  });
  let eachParent = (node) => {
    if (node == null) return;
    let data = node[childName];
    let flag = true;
    for (let k in data) {
      let item = data[k];
      if (!item.selected) {
        flag = false;
        break;
      }
    }
    node.selected = flag;
    eachParent(node.parent);
  }
  eachParent(item.parent);
}

/**
 * @description 深度优先遍历
 * @param {Array,JSON} data 数据
 * @param callback 回调
 * @param options 配置
 * @constructor
 */
function DFS(data, callback = error('callback'), options = {}) {
  let _options = Object.assign({}, {
    child: "data"
  }, options);
  let {
    child
  } = _options;
  if (!!data) {
    let stack = [];
    if (Array.isArray(data))
      for (let i = data.length - 1; i >= 0; i--) {
        let item = data[i];
        item._tier = 0;
        stack.push(item);
      }
    else if (typeof data === "object") {
      data._tier = 0;
      stack.push(data);

    }
    while (stack.length > 0) {
      let item = stack.pop();
      let tier = item._tier;
      tier ++;
      callback(item);
      let children = item[child] || [];
      for (let i = children.length - 1; i >= 0; i--) {
        children[i]._tier = tier;
        stack.push(children[i]);
      }
    }
  }
}

/**
 * @description 获取对象的数量
 * @param obj
 * @return {number}
 */
function length(obj) {
  if (Array.isArray(obj) || typeof obj === "string") return obj.length;
  else if (typeof obj === "object") {
    let len = 0;
    for (let i in obj) len++;
    return len;
  } else {
    throw new Error("[Type Error] length 方法的参数应该为 Object , 不应为:" + typeof obj);
  }
}

/**
 * @description 将json对象转换为map对象
 * @param obj
 * @return {Map<any, any>}
 * @constructor
 */
function jsonToMap(obj){
  let m = new Map();
  for (let i in obj)m.set(i,obj[i]);
  return m;
}

/**
 * @description 将简单的JSON对象转换为Array
 * @param obj
 * @constructor
 */
function jsonToArray(obj){
  let temp = []
  for (let k in obj){
    temp.push({
      key:k,
      val:obj[k]
    })
  }
  return temp;
}

/**
 * @description 将对象中的数字,或字符串互相转换
 * @param obj 对象,数组
 * @param type 转换类型 0 ,转数字 , 1 转字符串
 * @return {Object}
 */
function objectNumberToggle(obj,type){
  for (let k in obj) {
    let item = obj[k];
    if (!type && typeof item !== "number") {
       obj[k] = parseInt(item);
    }else if(type && typeof item !== "string")
      obj[k] += "";
  }
  return obj;
}

/**
 * @desc 十六进制颜色转十进制 rgba()
 * @param {string} color
 * @param {number} opacity
 */
function colorHEXToDEC(color,opacity = 1){
  const _cont = color.split("#")[1];
  let rgba = [];
  for (let i = 0;i < _cont.length; i += 2){
    let str = _cont.slice(i,2+i);
    rgba.push(parseInt(str,16))
  }
  rgba.push(opacity);
  return `rgba(${rgba.join(",")})`;
}
/**
 * @description 网络错误处理函数
 * @param err Error对象
 * @param callback(text,type) 回调函数
 */
function networkHandle(err,callback){
  const msg = err.message.toLowerCase();
  let text = "";
  if (msg.indexOf("timeout") > -1){
    text = "请求超时";
  }else if(msg.indexOf("network") > -1) {
    text = "网络连接错误";
  }
  else text = err.message;
  callback(text,msg);
}

/**
 * @desc 禁用鼠标滚轮缩放页面
 */
function disableMousewheel(){
  document.addEventListener('keydown', function (event) {
    if ((event.ctrlKey === true || event.metaKey === true)
        && (event.which === 61 || event.which === 107
            || event.which === 173 || event.which === 109
            || event.which === 187 || event.which === 189)) {
      event.preventDefault();
    }
  }, false);
// Chrome IE 360
  window.addEventListener('mousewheel', function (event) {
    if (event.ctrlKey === true || event.metaKey) {
      event.preventDefault();
    }
  }, { passive: false });

//firefox
  window.addEventListener('DOMMouseScroll', function (event) {
    if (event.ctrlKey === true || event.metaKey) {
      event.preventDefault();
    }
  }, { passive: false });
}
// 根据屏幕宽度计算rem值
function calcRem (){
  let ww = document.documentElement.clientWidth;
  let rate = ww / 375;
  document.querySelector("html").style.fontSize = (rate) + "px"
}
// 设置微信标题
function setWxTitle(text){
  document.title = text;
  let dom = document.createElement('iframe')
  dom.style.display = 'none'
  dom.onload = function () {
    setTimeout(function () {
      dom.remove()
    }, 10)

  }

  document.body.appendChild(dom)
}

/**
 * @desc 全局监听promise catch的错误请求 , 并不在控制台打印
 * @param {function} callback 回调函数
 */
function listenPromiseCatch(callback = (e)=>{}){
  window.onunhandledrejection = function (event) {
    event && event.preventDefault();
    callback(event.reason);
  }
}
const tools = {
  error,
  getPaginationInfo,
  contrastTime,
  calcRem,
  GUID,
  getStorage,
  setStorage,
  setSession,
  getSession,
  CheckImgExists,
  count_down,
  checkInput,
  checkInputs,
  secretId,
  checkVersionUpdate,
  formatMoney,
  throttle,
  debounce,
  getObjectLowerList,
  GetBrowser,
  eachCheckboxTree,
  handleCheckedGroup,
  arrItemToString,
  DFS,
  length,
  jsonToMap,
  formatNumber,
  jsonToArray,
  objectNumberToggle,
  networkHandle,
  colorHEXToDEC,
  isEmpty,
  disableMousewheel,
  setWxTitle,
  listenPromiseCatch
}

module.exports = tools;
