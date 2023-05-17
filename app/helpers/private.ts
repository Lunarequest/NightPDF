import { TabGroup, Tab } from "electron-tabs";
import { create } from "nouislider";

function _try(func: Function, fallbackValue: number) {
	try {
		const value = func();
		return value === null || value === undefined ? fallbackValue : value;
	} catch (e) {
		return fallbackValue;
	}
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
): boolean {
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
	return true;
}

export { setupSliders };
