const {app,BrowserWindow,ThumbarButton,ipcMain} =  require("electron")
const path = require("path")
let win;
function createWindow(){
    win = new BrowserWindow({
        width:1200,
        height:800,
        webPreferences:{
            nodeIntegration:true,
            contextIsolation:false,
            preload:path.join(__dirname,"src/assets/js/index.js")
        },
        autoHideMenuBar:true,
    })
    win.maximize();
    // 页面加载
    // win.loadURL('http://sww.com.cn/');
    win.loadFile(path.join(__dirname,"src/pages/index.html"))
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
ipcMain.on('inject-script',()=>{

})
