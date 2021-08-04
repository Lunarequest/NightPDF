const { contextBridge, ipcRenderer } = require('electron');
const path  = require('path');

contextBridge.exposeInMainWorld('api',{
    getPath: (filePath) => {
        return path.parse(filePath).base;
    },

    removeAllListeners: (ListenerType) => {
        ipcRenderer.removeAllListeners(ListenerType);
    },

    openNewPDF: (pdf) => {
        ipcRenderer.send('openNewPDF',pdf);
    },
    newWindow: (file) => {
        ipcRenderer.send('newWindow',file);
    },
    togglePrinting: (value) => {
        ipcRenderer.send('togglePrinting',value)
    },
    resizeWindow: (value) => {
        ipcRenderer.send('resizeWindow', value)
    },
    on: (eventName, callback) => {
        ipcRenderer.on(eventName, callback)
    }
}); 