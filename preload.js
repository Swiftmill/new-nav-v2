const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  openExternal: (url) => ipcRenderer.send('open-external', url),
  windowControl: (action) => ipcRenderer.send('window-control', action),
  onWindowState: (callback) => {
    ipcRenderer.on('window-state', (_event, state) => callback(state));
  }
});
