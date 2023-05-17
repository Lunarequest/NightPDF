import { Tab } from "electron-tabs";

// Code to inject into the webview, to prevent jsPDF from intercepting keybinds
const keyInterceptor: string = `
var _ctrlCmdKeybinds = ["o", "p", "t", "w", "Tab", "F4", "PageUp", "PageDown", "0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];
var _ctrlCmdPlusShiftKeybinds = ["t", "w", "Tab", "PageUp", "PageDown", "Home", "End"];
function handleKeys(e) {
	// ctrl / cmd
	if (e.ctrlKey || e.metaKey) {
		if (_ctrlCmdKeybinds.includes(e.key)) {
			e.stopPropagation();
		}
		// ctrl / cmd + shift
		if (e.shiftKey) {
			if (_ctrlCmdPlusShiftKeybinds.includes(e.key)) {
				e.stopPropagation();
			}
		}
	}
};
document.addEventListener("keydown", handleKeys, true);
`;

function setupTab(tab: Tab, tabCssKey: Map<Tab, string>, debug = false) {
	tab.once("webview-dom-ready", () => {
		const content = tab.webview;
		if (debug) {
			// @ts-ignore
			content?.openDevTools();
		}
		// @ts-ignore
		content?.executeJavaScript(keyInterceptor);
		let style = "div#viewer .page {";
		style +=
			"filter: brightness(0.91) grayscale(0.95) invert(0.95) sepia(0.55) hue-rotate(180deg);";
		style += "border-image: none;";
		style += "}";
		// @ts-ignore
		content?.insertCSS(style).then((key: string) => {
			console.info("inserted style", key);
			tabCssKey.set(tab, key);
		});
		// .viewerContainer scrollbar dark colors
		// @ts-ignore
		content
			?.insertCSS(`
			:root {
				--dark-scrollbar-color: #1e1e1e;
				--dark-scrollbar-bg-color: #444444;
			}
			#viewerContainer {
				scrollbar-color: var(--dark-scrollbar-color) var(--dark-scrollbar-bg-color) !important;
			}
			#viewerContainer::-webkit-scrollbar {
				width: 15px !important;
				height: 15px !important;
			}
			#viewerContainer::-webkit-scrollbar-track {
				background-color: var(--dark-scrollbar-bg-color) !important;
			}
			#viewerContainer::-webkit-scrollbar-thumb {
				background-color: var(--dark-scrollbar-color) !important;
			}
			#viewerContainer::-webkit-scrollbar-track-piece {
				background-color: var(--dark-scrollbar-bg-color) !important;
			}
			#viewerContainer::-webkit-scrollbar-corner {
				background-color: var(--dark-scrollbar-bg-color) !important;
			}`)
			.then((key: string) => {
				console.info("inserted style", key);
			});
	});
	tab.on("close", (tab: Tab) => {
		const key = tabCssKey.get(tab);
		if (key) {
			tabCssKey.delete(tab);
		}
	});
}

export { setupTab };
