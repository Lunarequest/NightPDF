import { TabGroup, Tab } from "electron-tabs";
import { setupSliders, setupTab } from "./private";

async function openFile(
	file: string | string[],
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
	console.log("opening ", file);
	let slidersInitialized: boolean;
	if (sessionStorage.getItem("slidersInitialized")) {
		slidersInitialized = true;
	} else {
		slidersInitialized = false;
	}
	const tabs = tabGroup?.getTabs();
	if (!tabs || tabs.length === 0) {
		console.debug("No tabs yet, creating new tab");
	}
	let resolved_file: string;
	let title: string;
	console.debug(file);
	if (typeof file === "string") {
		resolved_file = await window.api.ResolvePath(file);
		title = await window.api.getFileName(file);
	} else {
		resolved_file = await window.api.ResolvePath(file[0]);
		title = await window.api.getFileName(file[0]);
	}
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
		pageArg = `page=${page}`;
	} else {
		pageArg = "pagemode=none";
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
				if (!slidersInitialized) {
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
					localStorage.setItem("slidersInitialized", "true");
				}
			},
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
	return true;
}

export { openFile };
