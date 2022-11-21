const {app,BrowserWindow,ThumbarButton,nativeImage} =  require("electron")
const path = require("path")
function createWindow(){
    const win = new BrowserWindow({
        width:1200,
        height:800,
        webPreferences:{
            preload:path.join(__dirname,"src/assets/js/index.js")
        },
        autoHideMenuBar:true
    })
    // 页面加载
    win.loadURL('http://sww.com.cn/');
    let context = win.webContents;
    // 打开调试器
    // context.openDevTools();
    // 当浏览器加载停止
    context.on("did-finish-load",function () {
        this.send('loaded','did-finish-load')
    })
}
app.whenReady().then(()=>{
    createWindow();
})
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})
