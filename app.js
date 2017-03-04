const {
    app,
    BrowserWindow
} = require('electron');
const path = require('path');
const url = require('url');
const {
    autoUpdater
} = require("electron-updater");


let win;

function createWindow() {
    // Create the browser window.
    win = new BrowserWindow({
        width: 800,
        height: 600
    });

    // and load the index.html of the app.
    win.loadURL(url.format({
        pathname: path.join(__dirname, 'index.html'),
        protocol: 'file:',
        slashes: true
    }));

    win.on('closed', () => {
        win = null;
    });
}


autoUpdater.on('update-downloaded', (ev, info) => {
    autoUpdater.quitAndInstall();
});

app.on('ready', function() {
    autoUpdater.checkForUpdates();
    createWindow();
});
