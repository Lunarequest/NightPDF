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

import "electron-tabs";
import { Tab, TabGroup } from "electron-tabs";
import { API, create } from "nouislider";

function _try(func: Function, fallbackValue: number) {
	try {
		const value = func();
		return value === null || value === undefined ? fallbackValue : value;
	} catch (e) {
		return fallbackValue;
	}
}

declare global {
	interface Window {
		api: {
			getFileName(arg0: string): Promise<string>;
			ResolvePath(arg0: string): Promise<string>;
			removeAllListeners(arg0: string): null;
			openNewPDF(arg0: null | string): null;
			newWindow(arg0: string | string[]): null;
			newTab(arg0: string | string[]): null;
			togglePrinting(arg0: Boolean): null;
			resizeWindow(arg0: null | string): null;
			on(arg0: string, arg1: CallableFunction): null;
		};
	}
	interface HTMLElement {
		noUiSlider: API;
	}
	interface File {
		path: string;
	}

}

const nightPDF = (async function () {
	console.log("loading");
	let _appContainerElement: HTMLElement;
	let _headerElement: HTMLElement;
	// let _titleElement: HTMLElement;
	let _darkConfiguratorElement: HTMLElement;
	let _brightnessSliderElement: HTMLElement;
	let _grayscaleSliderElement: HTMLElement;
	let _invertSliderElement: HTMLElement;
	let _sepiaSliderElement: HTMLElement;
	let _hueSliderElement: HTMLElement;
	let _extraBrightnessSliderElement: HTMLElement;
	let _splashElement: HTMLElement;
	let _defaultButton: HTMLElement;
	let _sepiaButton: HTMLElement;
	let _redeyeButton: HTMLElement;
	let _customButton: HTMLElement;
	let _tabGroup: TabGroup | null = null;
	let _slidersInitialized = false;
	const _tabCssKey: Map<Tab, string> = new Map();
	const _tabFilePath: Map<Tab, string> = new Map();

	async function main() {
		_appContainerElement = document.getElementById(
			"appContainer",
		) as HTMLElement;
		_appContainerElement.style.display = "none";
		_tabGroup = document.querySelector("tab-group");
		_tabGroup?.on("ready", (tabGroup: TabGroup) => {
			// replace new tabe default "click" event handler
			tabGroup.buttonContainer
					.getElementsByTagName("button")[0]
					.addEventListener(
						"click",
						(e: Event) => {
							e.stopImmediatePropagation();
							window.api.openNewPDF(null);
						},
						true,
					);
					
			console.info("TabGroup is ready, moving container");
			_appContainerElement.appendChild(tabGroup.viewContainer);
			tabGroup?.viewContainer.addEventListener(
				"click",
				(e: Event) => {
					_hideDarkConfigurator();
					e.stopPropagation();
				},
				true,
			);
		});
		_headerElement = document.getElementById("header") as HTMLElement;
		_defaultButton = document.getElementById("default-button") as HTMLElement;
		_sepiaButton = document.getElementById("sepia-button") as HTMLElement;
		_redeyeButton = document.getElementById("redeye-button") as HTMLElement;
		_customButton = document.getElementById("custom-button") as HTMLElement;
		_darkConfiguratorElement = document.getElementById(
			"darkConfigurator",
		) as HTMLElement;
		_brightnessSliderElement = document.getElementById(
			"brightnessSlider",
		) as HTMLElement;
		_grayscaleSliderElement = document.getElementById(
			"grayscaleSlider",
		) as HTMLElement;
		_invertSliderElement = document.getElementById(
			"invertSlider",
		) as HTMLElement;
		_sepiaSliderElement = document.getElementById("sepiaSlider") as HTMLElement;
		_hueSliderElement = document.getElementById("hueSlider") as HTMLElement;
		_extraBrightnessSliderElement = document.getElementById(
			"extraBrightnessSlider",
		) as HTMLElement;
		_splashElement = document.getElementById("splash-container") as HTMLElement;

		//setup electron listeners
		window.api.removeAllListeners("file-open");
		window.api.on(
			"file-open",
			(_e: Event, msg: string | [string, number] | [string]) => {
				console.log(msg);
				if (typeof msg === "string") {
					_openFile(msg);
				} else {
					if (msg.length === 1) {
						// this case only occurs when launching from a started instance unsure why
						_openFile(msg[0]);
					} else {
						_openFile(msg[0][0], msg[1]);
					}
				}
			},
		);

		window.api.removeAllListeners("file-print");
		window.api.on("file-print", (_e: Event, _msg: string) => {
			const tab = _tabGroup?.getActiveTab()
			if (tab) {
				// the webview's window.print() method is intercepted
				// by pdfjs and opens the print dialog.
				// @ts-ignore
				tab.webview?.executeJavaScript("window.print();");
			}
		});

		// setup dom listeners
		_defaultButton.addEventListener("click", (e: Event) => {
			// do default styling

			if (_defaultButton.className.includes("active")) {
				_toggleDarkConfigurator();
			} else {
				_defaultButton.className = "button active";
				_sepiaButton.className = "button";
				_redeyeButton.className = "button";
				_customButton.className = "button";
				_handlePresetChange("default");
			}

			e.stopPropagation();
		});
		_sepiaButton.addEventListener("click", (e: Event) => {
			// do default styling
			if (_sepiaButton.className.includes("active")) {
				_toggleDarkConfigurator();
			} else {
				_defaultButton.className = "button";
				_sepiaButton.className = "button active";
				_redeyeButton.className = "button";
				_customButton.className = "button";
				_handlePresetChange("sepia");
			}
			e.stopPropagation();
		});
		_redeyeButton.addEventListener("click", (e: Event) => {
			// do default styling
			// only display menu if active
			if (_redeyeButton.className.includes("active")) {
				_toggleDarkConfigurator();
			} else {
				_defaultButton.className = "button";
				_sepiaButton.className = "button";
				_redeyeButton.className = "button active";
				_customButton.className = "button";
				_handlePresetChange("redeye");
			}
			e.stopPropagation();
		});

		_customButton.addEventListener("click", (e: Event) => {
			// do default styling
			// always display menu
			if (!_customButton.className.includes("active")) {
				_defaultButton.className = "button";
				_sepiaButton.className = "button";
				_redeyeButton.className = "button";
				_customButton.className = "button active";
				_handlePresetChange("original");
			}
			_toggleDarkConfigurator();
			e.stopPropagation();
		});

		_headerElement.addEventListener("click", (_e: Event) => {
			_hideDarkConfigurator();
		});

		

		_splashElement.addEventListener("click", (_e: Event) => {
			window.api.openNewPDF(null);
		});

		window.addEventListener("blur", function () {
			const activeElement = document.activeElement;
			if (activeElement) {
				if (activeElement.id === "pdfjs") {
					_hideDarkConfigurator();
				}
			}
		});

		_splashElement.ondrop = (e: DragEvent) => {
			console.log("files dropped");
			e.preventDefault();
			e.stopPropagation();

			const files = e.dataTransfer?.files;

			if (!files || files.length === 0) {
				return;
			}

			const fileToOpen = files[0];
			if (fileToOpen) {
				_openFile(fileToOpen.path);
			}
		};
		_splashElement.ondragover = (e: Event) => {
			console.log("file dragged");
			e.preventDefault();
			e.stopPropagation();
		};
	}

	const _toggleDarkConfigurator = () => {
		if (_darkConfiguratorElement.style.visibility === "visible") {
			_darkConfiguratorElement.style.visibility = "hidden";
		} else {
			_darkConfiguratorElement.style.visibility = "visible";
		}
	};

	const _hideDarkConfigurator = () => {
		if (_darkConfiguratorElement.style.visibility === "visible") {
			_darkConfiguratorElement.style.visibility = "hidden";
		}
	};

	const _openFile = async (
		file: string | string[],
		page: number | null = null,
	) => {
		console.log("opening ", file);
		const tabs = _tabGroup?.getTabs();
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
		_tabGroup?.eachTab((tab) => {
			if (_tabFilePath.get(tab) === resolved_file) {
				fileAlreadyOpen = true;
				console.info("file already open");
				_tabGroup?.setActiveTab(tab);
			}
		});

		let pageArg = "";
		if (page) {
			pageArg = `page=${page}`;
		} else {
			pageArg = "pagemode=none";
		}
		if (!fileAlreadyOpen) {
			const tab = _tabGroup?.addTab({
				title: title,
				src: `libs/pdfjs/web/viewer.html?file=${encodeURIComponent(
					resolved_file,
				)}#${pageArg}`,
				active: true,
				ready: (tab) => {
					console.info("tab loaded");
					_tabFilePath.set(tab, resolved_file);
					tab.element.classList.add("document-tab");
					_headerElement.style.visibility = "visible";
					_appContainerElement.style.display = "block";
					_splashElement.style.display = "none";
					window.api.togglePrinting(true);
					_setupDarkMode(tab);
					if (!_slidersInitialized) {
						_setupSliders();
					}
				},
			});
			tab?.on("close", () => {
				console.debug("tab closed");
				_tabFilePath.delete(tab);
				_tabGroup?.tabs.length;
				if (_tabGroup?.getTabs().length === 0) {
					_headerElement.style.visibility = "hidden";
					_splashElement.style.display = "flex";
					_appContainerElement.style.display = "none";
					window.api.togglePrinting(false);
				}
			});
		}
		return;
	};

	const _handlePresetChange = (preset: string) => {
		const brightness = _brightnessSliderElement.noUiSlider;
		const grayness = _grayscaleSliderElement.noUiSlider;
		const inversion = _invertSliderElement.noUiSlider;
		const sepia = _sepiaSliderElement.noUiSlider;
		const hue = _hueSliderElement.noUiSlider;
		const extraBrightness = _extraBrightnessSliderElement.noUiSlider;

		switch (preset) {
			case "default":
				brightness.set(7);
				grayness.set(95);
				inversion.set(95);
				sepia.set(55);
				hue.set(180);
				extraBrightness.set(0);
				break;
			case "original":
				brightness.set(0);
				grayness.set(0);
				inversion.set(0);
				sepia.set(0);
				hue.set(0);
				extraBrightness.set(0);
				break;
			case "redeye":
				brightness.set(8);
				grayness.set(100);
				inversion.set(92);
				sepia.set(100);
				hue.set(295);
				extraBrightness.set(-6);
				break;
			case "sepia":
				brightness.set(0);
				grayness.set(0);
				inversion.set(25);
				sepia.set(100);
				hue.set(0);
				extraBrightness.set(-30);
				break;
			default:
				brightness.set(9);
		}

		console.debug(preset, "changed");
	};

	const _setupSliders = () => {
		create(_brightnessSliderElement, {
			start: 7,
			step: 1,
			connect: "lower",
			range: {
				min: 0,
				max: 100,
			},
			tooltips: [
				{
					// 'to' the formatted value. Receives a number.
					to: function (value) {
						return `${Math.round(value)}%`;
					},
					// 'from' the formatted value.
					// Receives a string, should return a number.
					from: function (value) {
						return Number(value.replace("%", ""));
					},
				},
			],
		});

		create(_grayscaleSliderElement, {
			start: 95,
			step: 1,
			connect: "lower",
			range: {
				min: 0,
				max: 100,
			},
			tooltips: [
				{
					// 'to' the formatted value. Receives a number.
					to: function (value) {
						return `${Math.round(value)}%`;
					},
					// 'from' the formatted value.
					// Receives a string, should return a number.
					from: function (value) {
						return Number(value.replace("%", ""));
					},
				},
			],
		});

		create(_invertSliderElement, {
			start: 95,
			step: 1,
			connect: "lower",
			range: {
				min: 0,
				max: 100,
			},
			tooltips: [
				{
					// 'to' the formatted value. Receives a number.
					to: function (value) {
						return `${Math.round(value)}%`;
					},
					// 'from' the formatted value.
					// Receives a string, should return a number.
					from: function (value) {
						return Number(value.replace("%", ""));
					},
				},
			],
		});

		create(_sepiaSliderElement, {
			start: 55,
			step: 1,
			connect: "lower",
			range: {
				min: 0,
				max: 100,
			},
			tooltips: [
				{
					// 'to' the formatted value. Receives a number.
					to: function (value: number) {
						return `${Math.round(value)}%`;
					},
					// 'from' the formatted value.
					// Receives a string, should return a number.
					from: function (value: string) {
						return Number(value.replace("%", ""));
					},
				},
			],
		});

		create(_hueSliderElement, {
			start: 180,
			step: 1,
			connect: "lower",
			range: {
				min: 0,
				max: 360,
			},
			tooltips: [
				{
					// 'to' the formatted value. Receives a number.
					to: function (value: number) {
						return `${Math.round(value)}%`;
					},
					// 'from' the formatted value.
					// Receives a string, should return a number.
					from: function (value: string) {
						return Number(value.replace("°", ""));
					},
				},
			],
		});

		create(_extraBrightnessSliderElement, {
			start: 0,
			step: 1,
			connect: "lower",
			range: {
				min: -100,
				max: 200,
			},
			tooltips: [
				{
					// 'to' the formatted value. Receives a number.
					to: function (value: number) {
						return `${Math.round(value)}%`;
					},
					// 'from' the formatted value.
					// Receives a string, should return a number.
					from: function (value: string) {
						return Number(value.replace("%", ""));
					},
				},
			],
		});

		const sliders = [
			_brightnessSliderElement,
			_grayscaleSliderElement,
			_invertSliderElement,
			_sepiaSliderElement,
			_hueSliderElement,
			_extraBrightnessSliderElement,
		];
		sliders.map((slider) => {
			const namespace = _brightnessSliderElement.id;
			const eventName = `update.${namespace}`;
			slider.noUiSlider.on(eventName, () => {
				updateCSS();
			});
		});
		_slidersInitialized = true;
	};

	const _setupDarkMode = (tab: Tab) => {
		tab.once("webview-dom-ready", () => {
			const style = document.createElement("style");
			const content = tab.webview;
			style.setAttribute("id", "pageStyle");
			style.textContent = "div#viewer .page {";
			style.textContent +=
				"filter: brightness(0.91) grayscale(0.95) invert(0.95) sepia(0.55) hue-rotate(180deg);";
			style.textContent += "border-image: none;";
			style.textContent += "}";
			// @ts-ignore
			content?.insertCSS(style.textContent).then((key: string) => {
				console.info("inserted style", key);
				_tabCssKey.set(tab, key);
			});
		});
		tab.on("close", (tab) => {
			const key = _tabCssKey.get(tab);
			if (key) {
				_tabCssKey.delete(tab);
			}
		});
	};

	const _updateDarkSettings = (cssFilter: string) => {
		let cssRule: string;
		cssRule = "div#viewer .page {";
		cssRule += cssFilter;
		cssRule += "border-image: none;";
		cssRule += "}";
		_tabGroup?.eachTab((tab) => {
			const content = tab.webview;
			if (content) {
				if (_tabCssKey.has(tab)) {
					const key = _tabCssKey.get(tab);
					// @ts-ignore
					content.removeInsertedCSS(key);
				}
				// @ts-ignore
				content.insertCSS(cssRule).then((key: string) => {
					console.info("inserted style", key);
					_tabCssKey.set(tab, key);
				});
			}
		});
	};

	const updateCSS = () => {
		const brightness = _try(() => _brightnessSliderElement.noUiSlider.get(), 0);
		const grayness = _try(() => _grayscaleSliderElement.noUiSlider.get(), 0);
		const inversion = _try(() => _invertSliderElement.noUiSlider.get(), 0);
		const sepia = _try(() => _sepiaSliderElement.noUiSlider.get(), 0);
		const hue = _try(() => _hueSliderElement.noUiSlider.get(), 0);
		const extraBrightness = _try(
			() => _extraBrightnessSliderElement.noUiSlider.get(),
			0,
		);

		let cssRule = "";
		cssRule += "filter: ";
		cssRule += `brightness(${(100 - brightness) / 100}) `;
		cssRule += `grayscale(${grayness / 100}) `;
		cssRule += `invert(${inversion / 100}) `;
		cssRule += `sepia(${sepia / 100}) `;
		cssRule += `hue-rotate(${hue}deg) `;
		cssRule += `brightness(${(Math.round(extraBrightness) + 100.0) / 100});`;

		_updateDarkSettings(cssRule);
	};

	return {
		run: main,
	};
})();

const n = await nightPDF;
n.run();
