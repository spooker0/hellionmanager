const {
    app,
    BrowserWindow,
    Menu
} = require('electron');
const path = require('path');
const url = require('url');
const {
    autoUpdater
} = require("electron-updater");


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
                console.log('About Clicked');
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
