const { app, BrowserWindow, Menu, dialog, MenuItem, ipcMain } = require('electron');

let wins = [];
let menuIsConfigured = false;

function createWindow(filename = null) {
	// Create the browser window.
	let win = new BrowserWindow({
		width: 1200,
		height: 800,
		minWidth: 500,
		minHeight: 200,
		resizable: true,
		webPreferences: {
			plugins: true,
			nodeIntegration: true
		},
		titleBarStyle: 'default',
		show: false
	});
	wins.push(win);

	// and load the index.html of the app.
	win.loadFile('app/index.html');
	//win.openDevTools();

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

	const menu = Menu.getApplicationMenu();
	fileMenu = menu.items.find((item) => item.label === 'File');

	const openOption = new MenuItem({
		label: 'Open...',
		id: 'file-open',
		accelerator: 'CmdOrCtrl+O'
	});

	const printOption = new MenuItem({
		label: 'Print',
		id: 'file-print',
		accelerator: 'CmdOrCtrl+P',
		enabled: false,
		click() {
			win.webContents.send('file-print');
		}
	});

	const separator = new MenuItem({
		type: 'separator'
	});

	if (!menuIsConfigured) {
		fileMenu.submenu.insert(0, openOption);
		fileMenu.submenu.insert(1, separator);
		fileMenu.submenu.append(separator);
		fileMenu.submenu.append(printOption);
		Menu.setApplicationMenu(menu);
		menuIsConfigured = true;
	}

	// El tema es que este siempre esta ligado a la ultima ventana
	menu.getMenuItemById('file-open').click = () => {
		dialog
			.showOpenDialog(null, {
				properties: [ 'openFile' ],
				filters: [ { name: 'PDF Files', extensions: [ 'pdf' ] } ]
			})
			.then((dialogReturn) => {
				const filename = dialogReturn['filePaths'][0];
				if (filename) {
					if (wins.length === 0) {
						createWindow(filename.toString());
					} else {
						win.webContents.send('file-open', filename.toString());
					}
				}
			});
	};

	ipcMain.removeAllListeners('togglePrinting');
	ipcMain.once('togglePrinting', (e, msg) => {
		menu.getMenuItemById('file-print').enabled = Boolean(msg);
	});

	ipcMain.removeAllListeners('newWindow');
	ipcMain.once('newWindow', (e, msg) => {
		console.log('opening ', msg, ' in new window');
		createWindow(msg);
	});
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
	// On macOS it is common for applications and their menu bar
	// to stay active until the user quits explicitly with Cmd + Q
	if (process.platform !== 'darwin') {
		app.quit();
	}
});

app.on('activate', () => {
	// On macOS it's common to re-create a window in the app when the
	// dock icon is clicked and there are no other windows open.
	if (BrowserWindow.getAllWindows().length === 0) {
		createWindow();
	}
});
