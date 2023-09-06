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
	IpcMainEvent,
	IpcMainInvokeEvent,
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
	KeybindsHelper,
} from "../helpers/settings";
import { createMenu } from "./menutemplate";

// Workaround if the schema is invalid
// see: https://github.com/sindresorhus/electron-store/issues/116#issuecomment-816515814
const makeStore = (
	options: Store.Options<NightPDFSettings>,
): Store<NightPDFSettings> => {
	try {
		return new Store<NightPDFSettings>(options);
	} catch (e) {
		console.error(e);
		console.log("Resetting configuration...");
		const store = new Store<NightPDFSettings>({
			...options,
			schema: undefined,
		});
		store.clear();
		return new Store<NightPDFSettings>(options);
	}
};

const default_settings = nightpdf_default_settings(version);
const store = makeStore({
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
		const general = store.get("general");
		if (general) {
			if (typeof general.DisplayThumbs !== "boolean") {
				general.DisplayThumbs = true;
			}
			store.set("general", general);
		}
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
	return `NightPDF: ${version} PDF.js: ${pdfjsver} Electron: v${process.versions.electron}`;
}

function setkeybind(id: string, command: Keybinds) {
	const storeKeybinds = store.get("keybinds");
	if (!storeKeybinds) {
		throw new Error("keybinds not found in store");
	}
	storeKeybinds[id] = command;
	console.debug("id", id);
	console.debug("command", command);
	console.debug(storeKeybinds);
	store.set("keybinds", storeKeybinds);
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
	// @ts-ignore - will-navigate is not in the type definition
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
				// rome-ignore lint: don't double wrap array
				filename = Array.isArray(filename) ? filename : [filename];
				win.webContents.send("file-open", filename);
			}
			win.show();
		} else {
			win.show();
		}
		if (fileToOpen) {
			if (store.store.general.MaximizeOnOpen) {
				win.maximize();
			}
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

		ipcMain.handle("getPath", (_e: IpcMainInvokeEvent, args: string) => {
			return getpath(args);
		});

		ipcMain.handle("ResolvePath", (_e: IpcMainInvokeEvent, args: string) => {
			return resolve(args);
		});

		ipcMain.on("openExternal", async (_e: IpcMainEvent, url: string) => {
			await shell.openExternal(url);
			log.debug(`${url} is 3rd party content opening externally`);
		});

		ipcMain.on(
			"SetBind",
			(_e: IpcMainEvent, newKeybind: [string, Keybinds]) => {
				setkeybind(newKeybind[0], newKeybind[1]);
			},
		);
		ipcMain.on(
			"SetSetting",
			(_e: IpcMainEvent, newSetting: [string, string, unknown]) => {
				const [settingGroup, key, value] = newSetting;
				const storeSettings = store.get(settingGroup);
				if (!storeSettings) {
					throw new Error(`${settingGroup} not found in store`);
				}
				if (!Object.prototype.hasOwnProperty.call(storeSettings, key)) {
					throw new Error(`${key} not found in ${settingGroup} in store`);
				}
				// @ts-ignore
				storeSettings[key] = value;
				store.set(settingGroup, storeSettings);
			},
		);

		ipcMain.handle("GetSettings", (_e: IpcMainInvokeEvent) => {
			return store.store;
		});

		ipcMain.handle("GetVersion", (_e: IpcMainInvokeEvent) => {
			return versionString();
		});
		Menu.setApplicationMenu(menu);
		menuIsConfigured = true;
	}

	const openNewPDF = () => {
		dialog
			.showOpenDialog(win, {
				properties: ["openFile", "multiSelections"],
				filters: [{ name: "PDF Files", extensions: ["pdf"] }],
			})
			.then((dialogReturn: OpenDialogReturnValue) => {
				const filenames = dialogReturn.filePaths;
				if (filenames && filenames.length > 0) {
					if (wins.length === 0) {
						createWindow(filenames);
					} else {
						const focusedWin = BrowserWindow.getFocusedWindow();
						if (focusedWin) {
							focusedWin.webContents.send("file-open", filenames, DEBUG);
							if (store.store.general.MaximizeOnOpen) {
								focusedWin.maximize();
							}
						}
					}
				}
			});
	};

	ipcMain.removeAllListeners("togglePrinting");
	ipcMain.on("togglePrinting", (_e: IpcMainEvent, msg: string) => {
		const menu = Menu.getApplicationMenu();
		if (menu) {
			const print = menu.getMenuItemById("file-print");
			if (print) {
				print.enabled = Boolean(msg);
			}
		}
	});

	ipcMain.removeAllListeners("newWindow");
	ipcMain.once("newWindow", (_e: IpcMainEvent, msg: undefined | null) => {
		log.debug("opening ", msg, " in new window");
		createWindow(msg);
	});

	ipcMain.removeAllListeners("resizeWindow");
	ipcMain.once("resizeWindow", (_e: IpcMainEvent, _msg: string) => {
		const { width, height } = win.getBounds();
		if (width < 1000 || height < 650) {
			win.setResizable(true);
			win.setSize(1000, 650);
			win.center();
		}
	});

	ipcMain.removeAllListeners("openNewPDF");
	ipcMain.on("openNewPDF", (_e: IpcMainEvent, _msg: null) => {
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
	.array("pdf")
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

// @ts-ignore - open-file is not in the electron type definitions
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
	const keybinds: KeybindsHelper = new KeybindsHelper(
		store.get("keybinds") as Record<string, Keybinds>,
		process.platform,
	);
	if (fileToOpen) {
		if (typeof fileToOpen === "string") {
			fileToOpen.replace("file://", "");
		} else {
			let i;
			for (i in fileToOpen) {
				fileToOpen[i] = fileToOpen[i].replace("file://", "");
			}
		}
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

	keybinds.actions.forEach((action) => {
		globalShortcut.registerAll(
			keybinds.getActionKeybindsTrigger(action),
			() => {
				const focusedWin = BrowserWindow.getFocusedWindow();
				if (focusedWin) {
					focusedWin.webContents.send(
						keybinds.getAction(action),
						keybinds.getActionData(action),
					);
				}
			},
		);
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
