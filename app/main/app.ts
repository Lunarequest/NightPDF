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
import {
	app,
	BrowserWindow,
	Menu,
	dialog,
	ipcMain,
	shell,
	nativeTheme,
	globalShortcut,
	Notification,
} from "electron";
import type { OpenDialogReturnValue } from "electron";
import { parse, join, resolve } from "path";
import { version } from "../../package.json";
import { autoUpdater } from "electron-updater";
import { readFileSync } from "fs";
import log from "electron-log";
import yargs from "yargs";
import Store from "electron-store";
import {
	nightpdf_schema,
	NightPDFSettings,
	Keybinds,
	nightpdf_default_settings,
} from "../helpers/settings";
import { createMenu } from "./menutemplate";

const default_settings = nightpdf_default_settings(version);

const store = new Store<NightPDFSettings>({
	schema: nightpdf_schema,
	defaults: default_settings,
	clearInvalidConfig: true,
});

let wins = [];
let menuIsConfigured = false;

const DEBUG = process.env.DEBUG;
const FLATPAK = process.env.FLATPAK;
const linux = process.platform === "linux";
log.transports.file.level = "debug";

const NOTIFICATION_TITLE = "Trans rights";
const NOTIFICATION_BODY = "Trans rigths are human rigths 🏳️‍⚧️";

//in the future this can be use for migrations
const store_version = store.get("version");
if (store_version) {
	if (store_version !== version) {
		console.log(`update store to ${version}`);
		store.set("version", version);
	}
} else {
	store.set("version", version);
}

function getpath(filePath: string) {
	return parse(filePath).base;
}

function versionString(): string {
	const pdfjsver = readFileSync(join(__dirname, "../../.pdfjs_version"));
	return `NightPDF: v${version} PDF.js: ${pdfjsver} Electron: v${process.versions.electron}`;
}

function setkeybind(id: string, command: string) {
	store.set(id, command);
}

function createWindow(
	filename: string | string[] | null = null,
	page: number | null = null,
) {
	//force dark theme irespective of os theme
	//useful for linux since we don't have a standardised way of detecting dark theme
	nativeTheme.themeSource = "dark";
	// Create the browser window.
	const win = new BrowserWindow({
		width: 550,
		height: 420,
		minWidth: 565,
		icon: join(__dirname, "../assets/icon.png"),
		minHeight: 200,
		webPreferences: {
			sandbox: true,
			webviewTag: true,
			preload: resolve(join(__dirname, "../preload/preload.js")),
		},
		resizable: true,
		titleBarStyle: "default",
		show: false,
	});
	if (!(linux && FLATPAK)) {
		try {
			autoUpdater.logger = log;
			autoUpdater.checkForUpdatesAndNotify();
		} catch (e) {
			if (DEBUG) {
				log.error(e);
			}
		}
	}
	wins.push(win);

	// and load the index.html of the app.

	win.loadFile(join(__dirname, "../index.html"));
	const wc = win.webContents;
	// if the window url changes from the inital one,
	// block the change and use xdg-open to open it
	wc.on("will-navigate", function (e: Event, url: string) {
		if (url !== wc.getURL()) {
			e.preventDefault();
			if (url.split("/")[0].indexOf("http") > -1) {
				shell.openExternal(url);
				log.debug(`${url} is 3rd party content opening externally`);
			}
		}
	});

	win.once("closed", () => {
		// Dereference the window object, usually you would store windows
		// in an array if your app supports multi windows, this is the time
		// when you should delete the corresponding element.
		wins = [];
	});

	win.webContents.removeAllListeners("did-finish-load");
	win.webContents.once("did-finish-load", () => {
		// avoid race condition
		if (DEBUG) {
			win.webContents.openDevTools();
		}
		if (filename) {
			if (page) {
				win.webContents.send("file-open", [filename, page]);
			} else {
				win.webContents.send("file-open", [filename]);
			}
			win.show();
		} else {
			win.show();
		}
		if (fileToOpen) {
			win.maximize();
		}
	});

	if (!menuIsConfigured) {
		const template = createMenu();
		const menu = Menu.buildFromTemplate(template);
		const file_open = menu.getMenuItemById("file-open");
		const print = menu.getMenuItemById("file-print");

		if (file_open) {
			file_open.click = () => {
				openNewPDF();
			};
		}

		if (print) {
			print.click = () => {
				const focusedWin = BrowserWindow.getFocusedWindow();
				if (focusedWin) {
					focusedWin.webContents.send("file-print");
				}
			};
		}

		ipcMain.handle("getPath", (_e: Event, args: string) => {
			return getpath(args);
		});

		ipcMain.handle("ResolvePath", (_e: Event, args: string) => {
			return resolve(args);
		});

		ipcMain.on("openExternal", async (_e: Event, url: string) => {
			await shell.openExternal(url);
			log.debug(`${url} is 3rd party content opening externally`);
		});

		ipcMain.on("SetBind", (_e: Event, args: string[]) => {
			setkeybind(args[0], args[1]);
		});
		ipcMain.handle("GetSettings", (_e: Event) => {
			return store.store;
		});
		Menu.setApplicationMenu(menu);
		menuIsConfigured = true;
	}

	const openNewPDF = () => {
		dialog
			.showOpenDialog(win, {
				properties: ["openFile"],
				filters: [{ name: "PDF Files", extensions: ["pdf"] }],
			})
			.then((dialogReturn: OpenDialogReturnValue) => {
				const filename = dialogReturn["filePaths"][0];
				if (filename) {
					if (wins.length === 0) {
						createWindow(filename.toString());
					} else {
						const focusedWin = BrowserWindow.getFocusedWindow();
						if (focusedWin) {
							focusedWin.webContents.send(
								"file-open",
								filename.toString(),
								DEBUG,
							);
							focusedWin.maximize();
						}
					}
				}
			});
	};

	ipcMain.removeAllListeners("togglePrinting");
	ipcMain.on("togglePrinting", (_e: Event, msg: string) => {
		const menu = Menu.getApplicationMenu();
		if (menu) {
			const print = menu.getMenuItemById("file-print");
			if (print) {
				print.enabled = Boolean(msg);
			}
		}
	});

	ipcMain.removeAllListeners("newWindow");
	ipcMain.once("newWindow", (_e: Event, msg: undefined | null) => {
		log.debug("opening ", msg, " in new window");
		createWindow(msg);
	});

	ipcMain.removeAllListeners("resizeWindow");
	ipcMain.once("resizeWindow", (_e: Event, _msg: string) => {
		const { width, height } = win.getBounds();
		if (width < 1000 || height < 650) {
			win.setResizable(true);
			win.setSize(1000, 650);
			win.center();
		}
	});

	ipcMain.removeAllListeners("openNewPDF");
	ipcMain.on("openNewPDF", (_e: Event, _msg: null) => {
		openNewPDF();
	});
}

let fileToOpen: string | string[] = "";
let pageToOpen: number | null = null;

const argv = yargs
	.scriptName("NightPDF")
	.usage("Usage: $0 [-p] <pdf>")
	.example("$0 -p 5 pdf.pdf", "Loads pdf on the 5th page")
	.option("p", {
		alias: "pages",
		describe: "The page to open in the pdf",
		type: "number",
	})
	.positional("pdf", {
		describe: "The pdf to open",
		type: "string",
		alias: "pdf",
	})
	.describe("help", "Show help.") // Override --help usage message.
	.version(versionString())
	.epilog(`copyright ${new Date().getFullYear()}`)
	.parseSync();

const { p, _ } = argv;
const pdf = _ as string[]; // string[] or number[] force only string[]

if (pdf.length > 0) {
	fileToOpen = pdf;
	if (p) {
		pageToOpen = p;
	}
}

app.on("open-file", (e: Event, path: string) => {
	e.preventDefault();
	if (app.isReady()) {
		if (wins.length === 0) {
			createWindow(path);
		} else {
			const focusedWin = BrowserWindow.getFocusedWindow();
			if (focusedWin) {
				focusedWin.webContents.send("file-open", [path]);
			}
		}
	}
	fileToOpen = resolve(path);
});

app.whenReady().then(() => {
	const keybinds = store.get("keybinds") as Record<string, Keybinds>;
	if (fileToOpen) {
		if (pageToOpen) {
			createWindow(fileToOpen, pageToOpen);
		} else {
			createWindow(fileToOpen);
		}
	} else {
		createWindow();
	}

	globalShortcut.register("alt+CommandOrControl+t", () => {
		console.log(NOTIFICATION_BODY);
		new Notification({
			title: NOTIFICATION_TITLE,
			body: NOTIFICATION_BODY,
		}).show();
	});

	const keys = Object.keys(keybinds);
	keys.forEach((key) => {
		globalShortcut.registerAll(keybinds[key].trigger, () => {
			const focusedWin = BrowserWindow.getFocusedWindow();
			if (focusedWin) {
				focusedWin.webContents.send(keybinds[key].action, keybinds[key].data);
			}
		});
	});

	// register Ctrl+1 to Ctrl+9 shortcuts
	for (let i = 1; i <= 9; i++) {
		globalShortcut.register(`CommandOrControl+${i}`, () => {
			const focusedWin = BrowserWindow.getFocusedWindow();
			if (focusedWin) {
				focusedWin.webContents.send("switch-tab", i);
			}
		});
	}
});

app.on("window-all-closed", () => {
	if (process.platform !== "darwin") {
		app.quit();
	}
});

app.on("activate", () => {
	if (BrowserWindow.getAllWindows().length === 0) {
		createWindow();
	}
});
