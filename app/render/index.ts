/*
NightPDF Dark mode for Pdfs    
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
//trans rights

import "electron-tabs";
import { Tab, TabGroup } from "electron-tabs";
import { API } from "nouislider";
import { handlePresetChange } from "../helpers/sliders";
import { hideDarkConfigurator, toggleDarkConfigurator } from "../helpers/css";
import { openFile } from "../helpers/file";
import { NightPDFSettings } from "../helpers/settings";

declare global {
	interface Window {
		api: {
			getFileName(arg0: string): Promise<string>;
			ResolvePath(arg0: string): Promise<string>;
			SetBind(key: string, value: string): Promise<null>;
			GetSettings(): Promise<NightPDFSettings>;
			removeAllListeners(arg0: string): null;
			openNewPDF(arg0: null | string): null;
			newWindow(arg0: string | string[]): null;
			newTab(arg0: string | string[]): null;
			togglePrinting(arg0: Boolean): null;
			resizeWindow(arg0: null | string): null;
			on(arg0: string, arg1: CallableFunction): null;
			openExternel(url: string): null;
		};
	}
	interface HTMLElement {
		noUiSlider: API;
		insertCSS(css: string): Promise<string>;
	}
	interface File {
		path: string;
	}
	interface webviewTag extends HTMLElement {
		getURL(): string;
		stop(): void;
	}
	interface EventNav extends Event {
		url: string;
	}
}

async function nightPDF() {
	console.log("loading");
	const appContainerElement: HTMLElement = document.getElementById(
		"appContainer",
	) as HTMLElement;
	const headerElement: HTMLElement = document.getElementById(
		"header",
	) as HTMLElement;
	const darkConfiguratorElement: HTMLElement = document.getElementById(
		"darkConfigurator",
	) as HTMLElement;
	const brightnessSliderElement: HTMLElement = document.getElementById(
		"brightnessSlider",
	) as HTMLElement;
	const grayscaleSliderElement: HTMLElement = document.getElementById(
		"grayscaleSlider",
	) as HTMLElement;
	const invertSliderElement: HTMLElement = document.getElementById(
		"invertSlider",
	) as HTMLElement;
	const sepiaSliderElement: HTMLElement = document.getElementById(
		"sepiaSlider",
	) as HTMLElement;
	const hueSliderElement: HTMLElement = document.getElementById(
		"hueSlider",
	) as HTMLElement;
	const extraBrightnessSliderElement: HTMLElement = document.getElementById(
		"extraBrightnessSlider",
	) as HTMLElement;
	const splashElement: HTMLElement = document.getElementById(
		"splash-container",
	) as HTMLElement;
	const defaultButton: HTMLElement = document.getElementById(
		"default-button",
	) as HTMLElement;
	const sepiaButton: HTMLElement = document.getElementById(
		"sepia-button",
	) as HTMLElement;
	const redeyeButton: HTMLElement = document.getElementById(
		"redeye-button",
	) as HTMLElement;
	const customButton: HTMLElement = document.getElementById(
		"custom-button",
	) as HTMLElement;
	const tabGroup: TabGroup = document.querySelector("tab-group") as TabGroup;
	const tabCssKey: Map<Tab, string> = new Map();
	const tabFilePath: Map<Tab, string> = new Map();
	const closedFileHistory: string[] = [];

	appContainerElement.style.display = "none";
	tabGroup?.on("ready", (tabGroup: TabGroup) => {
		// replace new tabe default "click" event handler
		tabGroup.buttonContainer.getElementsByTagName("button")[0].addEventListener(
			"click",
			(e: Event) => {
				e.stopImmediatePropagation();
				window.api.openNewPDF(null);
			},
			true,
		);

		console.info("TabGroup is ready, moving container");
		appContainerElement.appendChild(tabGroup.viewContainer);
		tabGroup?.viewContainer.addEventListener(
			"click",
			(e: Event) => {
				hideDarkConfigurator(darkConfiguratorElement);
				e.stopPropagation();
			},
			true,
		);
	});

	//setup electron listeners
	window.api.removeAllListeners("file-open");
	window.api.on(
		"file-open",
		async (
			_e: Event,
			msg: string | [string, number] | [string],
			debug = false,
		) => {
			console.log(msg);
			if (typeof msg === "string") {
				await openFile(
					msg,
					closedFileHistory,

					tabGroup,
					tabFilePath,
					tabCssKey,

					appContainerElement,
					splashElement,
					headerElement,
					brightnessSliderElement,
					grayscaleSliderElement,
					invertSliderElement,
					sepiaSliderElement,
					extraBrightnessSliderElement,
					hueSliderElement,

					null,
					debug,
				);
			} else {
				if (msg.length === 1) {
					// this case only occurs when launching from a started instance unsure why
					await openFile(
						msg,
						closedFileHistory,

						tabGroup,
						tabFilePath,
						tabCssKey,

						appContainerElement,
						splashElement,
						headerElement,
						brightnessSliderElement,
						grayscaleSliderElement,
						invertSliderElement,
						sepiaSliderElement,
						extraBrightnessSliderElement,
						hueSliderElement,

						null,
						debug,
					);
				} else {
					await openFile(
						msg[0][0],
						closedFileHistory,

						tabGroup,
						tabFilePath,
						tabCssKey,

						appContainerElement,
						splashElement,
						headerElement,
						brightnessSliderElement,
						grayscaleSliderElement,
						invertSliderElement,
						sepiaSliderElement,
						extraBrightnessSliderElement,
						hueSliderElement,

						msg[1],
						debug,
					);
				}
			}
		},
	);

	window.api.removeAllListeners("file-print");
	window.api.on("file-print", (_e: Event, _msg: string) => {
		const tab = tabGroup?.getActiveTab();
		if (tab) {
			// the webview's window.print() method is intercepted
			// by pdfjs and opens the print dialog.
			// @ts-ignore
			tab.webview?.executeJavaScript("window.print();");
		}
	});

	// close-tab event
	window.api.removeAllListeners("close-tab");
	window.api.on("close-tab", (_e: Event, _msg: string) => {
		const tab = tabGroup?.getActiveTab();
		if (tab) {
			console.log("Closing active tab.");
			tab.close(false);
		}
	});

	// reopen-tab event
	window.api.removeAllListeners("reopen-tab");
	window.api.on(
		"reopen-tab",
		async (_e: Event, _msg: string, debug = false) => {
			if (closedFileHistory.length > 0) {
				const lastClosedFile = closedFileHistory.pop();
				if (lastClosedFile) {
					await openFile(
						lastClosedFile,
						closedFileHistory,

						tabGroup,
						tabFilePath,
						tabCssKey,

						appContainerElement,
						splashElement,
						headerElement,
						brightnessSliderElement,
						grayscaleSliderElement,
						invertSliderElement,
						sepiaSliderElement,
						extraBrightnessSliderElement,
						hueSliderElement,

						null,
						debug,
					);
				}
			}
		},
	);

	// switch-tab event
	// expects "next", "prev" or a number from 1-9
	window.api.removeAllListeners("switch-tab");
	window.api.on("switch-tab", (_e: Event, msg: string | number) => {
		const tab = tabGroup?.getActiveTab();
		// There is a bug in electron-tabs where
		// selecting the previous tab with "getPreviousTab" will never work if the previous
		// tab position === 0, see:
		// https://github.com/brrd/electron-tabs/blob/master/src/index.ts#L231

		// tabgroup methods return null if there is no tab
		let target: Tab | null | undefined = null;
		if (tab) {
			if (typeof msg === "string") {
				switch (msg) {
					case "next":
						console.log("switching to next tab");
						target = tabGroup?.getNextTab();
						break;
					case "prev": {
						console.log("switching to previous tab");
						// target = _tabGroup?.getPreviousTab();
						const targetPos = tab.getPosition() - 1;
						if (targetPos >= 0) {
							target = tabGroup?.getTabByPosition(targetPos);
						}
						break;
					}
				}
			} else {
				if (msg >= 1 && msg <= 8) {
					target = tabGroup?.getTabByPosition(msg - 1);
				} else if (msg === 9) {
					// last tab
					target = tabGroup?.getTabByPosition(-1);
				}
			}
			if (target) {
				target.activate();
			}
		}
	});

	// move-tab event
	// expects "next" or "prev", "start" or "end"
	window.api.removeAllListeners("move-tab");
	window.api.on("move-tab", (_e: Event, msg: string) => {
		const tab = tabGroup?.getActiveTab();
		if (tab) {
			switch (msg) {
				case "next": {
					console.log("moving tab to next position");
					const targetPos = tab.getPosition() + 1;
					const tabCount = tabGroup?.tabContainer.childElementCount;
					console.log("Tab count", tabCount, "targetPos", targetPos);
					if (tabCount && targetPos < tabCount) {
						tab.setPosition(targetPos);
					}
					break;
				}
				case "prev": {
					console.log("moving tab to previous position");
					const targetPos = tab.getPosition() - 1;
					if (targetPos >= 0) {
						tab.setPosition(targetPos);
					}
					break;
				}
				case "start":
					console.log("moving tab to start");
					tab.setPosition(0);
					break;
				case "end":
					console.log("moving tab to end");
					tab.setPosition(-1);
					break;
			}
		}
	});

	// setup dom listeners
	defaultButton.addEventListener("click", (e: Event) => {
		// do default styling

		if (defaultButton.className.includes("active")) {
			toggleDarkConfigurator(darkConfiguratorElement);
		} else {
			defaultButton.className = "button active";
			sepiaButton.className = "button";
			redeyeButton.className = "button";
			customButton.className = "button";
			handlePresetChange(
				"default",
				brightnessSliderElement,
				grayscaleSliderElement,
				invertSliderElement,
				sepiaSliderElement,
				extraBrightnessSliderElement,
				hueSliderElement,
			);
		}

		e.stopPropagation();
	});
	sepiaButton.addEventListener("click", (e: Event) => {
		// do default styling
		if (sepiaButton.className.includes("active")) {
			toggleDarkConfigurator(darkConfiguratorElement);
		} else {
			defaultButton.className = "button";
			sepiaButton.className = "button active";
			redeyeButton.className = "button";
			customButton.className = "button";
			handlePresetChange(
				"sepia",
				brightnessSliderElement,
				grayscaleSliderElement,
				invertSliderElement,
				sepiaSliderElement,
				extraBrightnessSliderElement,
				hueSliderElement,
			);
		}
		e.stopPropagation();
	});
	redeyeButton.addEventListener("click", (e: Event) => {
		// do default styling
		// only display menu if active
		if (redeyeButton.className.includes("active")) {
			toggleDarkConfigurator(darkConfiguratorElement);
		} else {
			defaultButton.className = "button";
			sepiaButton.className = "button";
			redeyeButton.className = "button active";
			customButton.className = "button";
			handlePresetChange(
				"redeye",
				brightnessSliderElement,
				grayscaleSliderElement,
				invertSliderElement,
				sepiaSliderElement,
				extraBrightnessSliderElement,
				hueSliderElement,
			);
		}
		e.stopPropagation();
	});

	customButton.addEventListener("click", (e: Event) => {
		// do default styling
		// always display menu
		if (!customButton.className.includes("active")) {
			defaultButton.className = "button";
			sepiaButton.className = "button";
			redeyeButton.className = "button";
			customButton.className = "button active";
			handlePresetChange(
				"original",
				brightnessSliderElement,
				grayscaleSliderElement,
				invertSliderElement,
				sepiaSliderElement,
				extraBrightnessSliderElement,
				hueSliderElement,
			);
		}
		toggleDarkConfigurator(darkConfiguratorElement);
		e.stopPropagation();
	});

	headerElement.addEventListener("click", (_e: Event) => {
		hideDarkConfigurator(darkConfiguratorElement);
	});

	splashElement.addEventListener("click", (_e: Event) => {
		window.api.openNewPDF(null);
	});

	window.addEventListener("blur", function () {
		const activeElement = document.activeElement;
		if (activeElement) {
			if (activeElement.id === "pdfjs") {
				hideDarkConfigurator(darkConfiguratorElement);
			}
		}
	});

	splashElement.ondrop = async (e: DragEvent, debug = false) => {
		console.log("files dropped");
		e.preventDefault();
		e.stopPropagation();

		const files = e.dataTransfer?.files;

		if (!files || files.length === 0) {
			return;
		}

		const fileToOpen = files[0];
		if (fileToOpen) {
			await openFile(
				fileToOpen.path,
				closedFileHistory,

				tabGroup,
				tabFilePath,
				tabCssKey,

				appContainerElement,
				splashElement,
				headerElement,
				brightnessSliderElement,
				grayscaleSliderElement,
				invertSliderElement,
				sepiaSliderElement,
				extraBrightnessSliderElement,
				hueSliderElement,

				null,
				debug,
			);
		}
	};
	splashElement.ondragover = (e: Event) => {
		console.log("file dragged");
		e.preventDefault();
		e.stopPropagation();
	};
}

await nightPDF();
