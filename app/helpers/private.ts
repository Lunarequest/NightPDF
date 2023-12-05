import { TabGroup, Tab } from "electron-tabs";
import { create } from "nouislider";

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

function _try(func: CallableFunction, fallbackValue: number) {
	try {
		const value = func();
		return value === null || value === undefined ? fallbackValue : value;
	} catch (e) {
		return fallbackValue;
	}
}

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

function updateDarkSettings(
	cssFilter: string,
	tabGroup: TabGroup,
	tabCssKey: Map<Tab, string>,
) {
	let cssRule: string;
	cssRule = "div#viewer .page {";
	cssRule += cssFilter;
	cssRule += "border-image: none;";
	cssRule += "}";
	tabGroup?.eachTab((tab) => {
		const content = tab.webview;
		if (content) {
			if (tabCssKey.has(tab)) {
				const key = tabCssKey.get(tab);
				// @ts-ignore
				content.removeInsertedCSS(key);
			}
			// @ts-ignore
			content.insertCSS(cssRule).then((key: string) => {
				console.info("inserted style", key);
				tabCssKey.set(tab, key);
			});
		}
	});
}

function updateCSS(
	brightnessSliderElement: HTMLElement,
	grayscaleSliderElement: HTMLElement,
	invertSliderElement: HTMLElement,
	sepiaSliderElement: HTMLElement,
	extraBrightnessSliderElement: HTMLElement,
	hueSliderElement: HTMLElement,
	tabGroup: TabGroup,
	tabCssKey: Map<Tab, string>,
) {
	const brightness = _try(() => brightnessSliderElement.noUiSlider.get(), 0);
	const grayness = _try(() => grayscaleSliderElement.noUiSlider.get(), 0);
	const inversion = _try(() => invertSliderElement.noUiSlider.get(), 0);
	const sepia = _try(() => sepiaSliderElement.noUiSlider.get(), 0);
	const hue = _try(() => hueSliderElement.noUiSlider.get(), 0);
	const extraBrightness = _try(
		() => extraBrightnessSliderElement.noUiSlider.get(),
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

	updateDarkSettings(cssRule, tabGroup, tabCssKey);
}

function setupSliders(
	brightnessSliderElement: HTMLElement,
	grayscaleSliderElement: HTMLElement,
	invertSliderElement: HTMLElement,
	sepiaSliderElement: HTMLElement,
	extraBrightnessSliderElement: HTMLElement,
	hueSliderElement: HTMLElement,
	tabGroup: TabGroup,
	tabCssKey: Map<Tab, string>,
) {
	create(brightnessSliderElement, {
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
				to: (value: number) => {
					return `${Math.round(value)}%`;
				},
				// 'from' the formatted value.
				// Receives a string, should return a number.
				from: (value: string) => {
					return Number(value.replace("%", ""));
				},
			},
		],
	});

	create(grayscaleSliderElement, {
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
				to: (value: number) => {
					return `${Math.round(value)}%`;
				},
				// 'from' the formatted value.
				// Receives a string, should return a number.
				from: (value: string) => {
					return Number(value.replace("%", ""));
				},
			},
		],
	});

	create(invertSliderElement, {
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
				to: (value: number) => {
					return `${Math.round(value)}%`;
				},
				// 'from' the formatted value.
				// Receives a string, should return a number.
				from: (value: string) => {
					return Number(value.replace("%", ""));
				},
			},
		],
	});

	create(sepiaSliderElement, {
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
				to: (value: number) => {
					return `${Math.round(value)}%`;
				},
				// 'from' the formatted value.
				// Receives a string, should return a number.
				from: (value: string) => {
					return Number(value.replace("%", ""));
				},
			},
		],
	});

	create(hueSliderElement, {
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
				to: (value: number) => {
					return `${Math.round(value)}%`;
				},
				// 'from' the formatted value.
				// Receives a string, should return a number.
				from: (value: string) => {
					return Number(value.replace("°", ""));
				},
			},
		],
	});

	create(extraBrightnessSliderElement, {
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
				to: (value: number) => {
					return `${Math.round(value)}%`;
				},
				// 'from' the formatted value.
				// Receives a string, should return a number.
				from: (value: string) => {
					return Number(value.replace("%", ""));
				},
			},
		],
	});

	const sliders = [
		brightnessSliderElement,
		grayscaleSliderElement,
		invertSliderElement,
		sepiaSliderElement,
		hueSliderElement,
		extraBrightnessSliderElement,
	];
	sliders.map((slider) => {
		const namespace = brightnessSliderElement.id;
		const eventName = `update.${namespace}`;
		slider.noUiSlider.on(eventName, () => {
			updateCSS(
				brightnessSliderElement,
				grayscaleSliderElement,
				invertSliderElement,
				sepiaSliderElement,
				extraBrightnessSliderElement,
				hueSliderElement,
				tabGroup,
				tabCssKey,
			);
		});
	});
}

export { setupSliders, setupTab };
