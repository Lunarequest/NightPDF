const { contextBridge, ipcRenderer } = require('electron');
const { path } = require('path')

contextBridge.exposeInMainWorld('Path',{
    getPath(filePath){
        return path.parse(filePath).base;
    }
})

contextBridge.exposeInMainWorld('Listeners', {
    removeAllListeners(ListenerType) {
        ipcRenderer.removeAllListeners(ListenerType);
    }
})

contextBridge.exposeInMainWorld('Send', {
    openNewPDF(pdf) {
        ipcRenderer.send('openNewPDF',pdf);
    },
    newWindow(file){
        ipcRenderer.send('newWindow',file);
    }
})

contextBridge.exposeInMainWorld('toggle', {
    togglePrinting(value){
        ipcRenderer.send('togglePrinting',value)
    },
    resizeWindow(value){
        ipcRenderer.send('resizeWindow', value)
    }
})