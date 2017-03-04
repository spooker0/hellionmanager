const {
    app,
    BrowserWindow,
    Menu,
    dialog
} = require('electron');
const path = require('path');
const url = require('url');
const {
    autoUpdater
} = require("electron-updater");
const aboutWindow = require('electron-about-window').default

let win;

function createWindow() {
    // Create the browser window.
    win = new BrowserWindow();
    win.maximize();

    // and load the index.html of the app.
    win.loadURL(url.format({
        pathname: path.join(__dirname, 'index.html'),
        protocol: 'file:',
        slashes: true
    }));

    const menuTemplate = [{
        label: 'Hellion Manager',
        submenu: [{
            label: 'About',
            click: () => {
                aboutWindow({
                    icon_path: path.join(__dirname, 'build/icon.ico'),
                    description: 'Hellion Server Settings Manager'
                });
            }
        }, {
            type: 'separator'
        }, {
            label: 'Quit',
            click: () => {
                app.quit();
            }
        }]
    }];
    const menu = Menu.buildFromTemplate(menuTemplate);
    Menu.setApplicationMenu(menu);

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

app.on('window-all-closed', () => {
    app.quit();
});
