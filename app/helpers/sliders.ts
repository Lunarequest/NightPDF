function handlePresetChange(
	preset: string,
	_brightnessSliderElement: HTMLElement,
	_grayscaleSliderElement: HTMLElement,
	_invertSliderElement: HTMLElement,
	_sepiaSliderElement: HTMLElement,
	_extraBrightnessSliderElement: HTMLElement,
	_hueSliderElement: HTMLElement,
) {
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
}

export { handlePresetChange };
