/*
NightPDF Dark mode for Ps    
Copyright (C) 2021  Advaith Madhukar

This program is free software; you can redistribute it and/or
modify it under the terms of the GNU General Public License
as published by the Free Software Foundation; version 2
of the License.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program; if not, write to the Free Software
Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
*/
/* eslint no-unused-vars: [ "error", { "argsIgnorePattern": "^_" } ] */
'use strict';
const {
    app,
    BrowserWindow,
    Menu,
    dialog,
    ipcMain,
    shell,
    nativeTheme,
} = require('electron');
const path = require('path');
import menutemplate from './menutemplate';
import { autoUpdater } from 'electron-updater';
let wins = [];
let menuIsConfigured = false;

const DEBUG = process.env.DEBUG;
const APPIMAGE = process.env.APPIMAGE;
const linux = process.platform === 'linux';
const windows = process.platform === 'win32';
const mac = process.platform === 'darwin';

function getpath(filePath: string) {
    return path.parse(filePath).base;
}

function createWindow(filename: string | null = null) {
    //force dark theme irespective of os theme
    //useful for linux since we don't have a standardised way of detecting dark theme
    nativeTheme.themeSource = 'dark';
    // Create the browser window.
    let win = new BrowserWindow({
        width: 550,
        height: 420,
        minWidth: 565,
        minHeight: 200,
        webPreferences: {
            sandbox: true,
            preload: path.resolve(
                path.join(__dirname, '../preload/preload.js')
            ),
        },
        resizable: true,
        titleBarStyle: 'default',
        show: false,
    });
    if ((linux && APPIMAGE) || windows || mac) {
        try {
            autoUpdater.checkForUpdatesAndNotify();
        } catch (e) {
            if (DEBUG) {
                console.log(e);
            }
        }
    }

    wins.push(win);

    // and load the index.html of the app.

    win.loadFile('app/index.html');
    if (DEBUG) {
        win.webContents.openDevTools();
    }
    let wc = win.webContents;
    // if the window url changes from the inital one,
    // block the change and use xdg-open to open it
    wc.on('will-navigate', function (e: Event, url: string) {
        if (url !== wc.getURL()) {
            e.preventDefault();
            if (url.split('/')[0].indexOf('http') > -1){
                shell.openExternal(url);
            }
            console.log('url is potentially insecure not going to open');
        }
    });

    win.once('closed', () => {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        wins = [];
    });

    win.webContents.removeAllListeners('did-finish-load');
    win.webContents.once('did-finish-load', () => {
        if (filename) {
            win.webContents.send('file-open', filename);
            win.show();
        } else {
            win.show();
        }
    });

    if (!menuIsConfigured) {
        let template = menutemplate.createMenu();
        const menu = Menu.buildFromTemplate(template);

        menu.getMenuItemById('file-open')!.click = () => {
            openNewPDF();
        };

        menu.getMenuItemById('file-print')!.click = () => {
            const focusedWin = BrowserWindow.getFocusedWindow();
            if (focusedWin) {
                focusedWin.webContents.send('file-print');
            }
        };

        Menu.setApplicationMenu(menu);
        menuIsConfigured = true;
    }

    const openNewPDF = () => {
        dialog
            .showOpenDialog(win, {
                properties: ['openFile'],
                filters: [{ name: 'PDF Files', extensions: ['pdf'] }],
            })
            .then((dialogReturn: any) => {
                const filename = dialogReturn['filePaths'][0];
                if (filename) {
                    if (wins.length === 0) {
                        createWindow(filename.toString());
                    } else {
                        const focusedWin = BrowserWindow.getFocusedWindow();
                        if (focusedWin) {
                            focusedWin.webContents.send(
                                'file-open',
                                filename.toString()
                            );
                            focusedWin.maximize();
                        }
                    }
                }
            });
    };

    ipcMain.removeAllListeners('togglePrinting');
    ipcMain.once('togglePrinting', (_e: Event, msg: string) => {
        const menu = Menu.getApplicationMenu();
        if (menu) {
            menu.getMenuItemById('file-print')!.enabled = Boolean(msg);
        }
    });

    ipcMain.removeAllListeners('newWindow');
    ipcMain.once('newWindow', (_e: Event, msg: undefined | null) => {
        console.log('opening ', msg, ' in new window');
        createWindow(msg);
    });

    ipcMain.removeAllListeners('resizeWindow');
    ipcMain.once('resizeWindow', (_e: Event, _msg: any) => {
        const { width, height } = win.getBounds();
        if (width < 1000 || height < 650) {
            win.setResizable(true);
            win.setSize(1000, 650);
            win.center();
        }
    });

    ipcMain.removeAllListeners('openNewPDF');
    ipcMain.once('openNewPDF', (_e: Event, _msg: null) => {
        openNewPDF();
    });

    ipcMain.handle('getPath', (_e: Event, args: string) => {
        return getpath(args);
    });
}

let fileToOpen: string = '';

const args = process.argv;
const argsLength = args.length;
if (argsLength > 1 && args[argsLength - 1].endsWith('.pdf')) {
    fileToOpen = args[argsLength - 1];
}

app.on('open-file', (e: Event, path: string) => {
    e.preventDefault();
    if (app.isReady()) {
        if (wins.length === 0) {
            createWindow(path.toString());
        } else {
            const focusedWin = BrowserWindow.getFocusedWindow();
            if (focusedWin) {
                focusedWin.webContents.send('file-open', path.toString());
            }
        }
    }
    fileToOpen = path.toString();
});

app.whenReady().then(() => {
    if (fileToOpen) {
        createWindow(fileToOpen);
    } else {
        createWindow();
    }
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});
