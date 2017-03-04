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
const package = require('./package.json');

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
                dialog.showMessageBox({
                    type: 'info',
                    title: 'About ' + package.name + ' v' + package.version,
                    message: package.description
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
