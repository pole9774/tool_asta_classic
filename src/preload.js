const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('api', {
	getObjects: () => ipcRenderer.invoke('get-objects'),
	addObject: (obj) => ipcRenderer.invoke('add-object', obj),
	updateObjectPosition: (data) => ipcRenderer.invoke('update-object-position', data),
	updateObject: (obj) => ipcRenderer.invoke('update-object', obj),
	deleteObject: (id) => ipcRenderer.invoke('delete-object', id),
});
