import { TabGroup, Tab } from "electron-tabs";
import { setupSliders, setupTab } from "./private";

async function openFile(
	files: string | string[] | FileList,
	closedFileHistory: string[],

	tabGroup: TabGroup,
	tabFilePath: Map<Tab, string>,
	tabCssKey: Map<Tab, string>,

	appContainerElement: HTMLElement,
	splashElement: HTMLElement,
	headerElement: HTMLElement,
	brightnessSliderElement: HTMLElement,
	grayscaleSliderElement: HTMLElement,
	invertSliderElement: HTMLElement,
	sepiaSliderElement: HTMLElement,
	extraBrightnessSliderElement: HTMLElement,
	hueSliderElement: HTMLElement,

	page: number | null = null,
	debug = false,
) {
	console.log("opening ", files);
	let slidersInitialized: boolean;
	console.log(sessionStorage.getItem("slidersInitialized"));
	if (sessionStorage.getItem("slidersInitialized")) {
		slidersInitialized = true;
	} else {
		slidersInitialized = false;
	}
	const tabs = tabGroup?.getTabs();
	if (!tabs || tabs.length === 0) {
		console.debug("No tabs yet, creating new tab");
	}

	console.debug(files);
	if (typeof files === "string") {
		// wrap in array
		// rome-ignore lint: ensure files is an array to use a for loop
		files = [files];
	}
	for (const file of files) {
		const path = typeof file === "string" ? file : file.path;
		const resolved_file = await window.api.ResolvePath(path);
		const title = await window.api.getFileName(path);
		// check if file is already open
		let fileAlreadyOpen = false;
		tabGroup?.eachTab((tab) => {
			if (tabFilePath.get(tab) === resolved_file) {
				fileAlreadyOpen = true;
				console.info("file already open");
				tab.activate();
			}
		});

		let pageArg = "";
		if (page) {
			pageArg = `page=${page}&pagemode=thumbs`;
		} else {
			pageArg = "pagemode=thumbs";
		}
		if (!fileAlreadyOpen) {
			const tab = tabGroup?.addTab({
				title: title,
				src: `libs/pdfjs/web/viewer.html?file=${encodeURIComponent(
					resolved_file,
				)}#${pageArg}`,
				active: true,
				ready: (tab: Tab) => {
					console.info("tab loaded");
					tabFilePath.set(tab, resolved_file);
					tab.element.classList.add("document-tab");
					headerElement.style.visibility = "visible";
					appContainerElement.style.display = "block";
					splashElement.style.display = "none";
					window.api.togglePrinting(true);
					setupTab(tab, tabCssKey, debug);
					if (slidersInitialized === false) {
						sessionStorage.setItem("slidersInitialized", "true");
						console.log("setting up sliders");
						setupSliders(
							brightnessSliderElement,
							grayscaleSliderElement,
							invertSliderElement,
							sepiaSliderElement,
							extraBrightnessSliderElement,
							hueSliderElement,
							tabGroup,
							tabCssKey,
						);
						slidersInitialized = true;
					}
				},
			});
			const webview = tab?.webview as webviewTag;
			webview.addEventListener("will-navigate", (e) => {
				const event = e as EventNav;
				const url = event.url;
				if (url !== webview.getURL()) {
					event.preventDefault();
					webview.stop();
					if (url.split("/")[0].indexOf("http") > -1) {
						window.api.openExternel(url);
					}
				}
			});
			tab?.on("close", () => {
				console.debug("tab closed");
				const tabFile = tabFilePath.get(tab);
				if (tabFile) {
					closedFileHistory.push(tabFile);
				}
				tabFilePath.delete(tab);
				tabGroup?.tabs.length;
				if (tabGroup?.getTabs().length === 0) {
					headerElement.style.visibility = "hidden";
					splashElement.style.display = "flex";
					appContainerElement.style.display = "none";
					window.api.togglePrinting(false);
				}
			});
		}
	}
	return true;
}

export { openFile };
