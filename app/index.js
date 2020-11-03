var isBrowser = navigator.userAgent.toLowerCase().indexOf(' electron/') == -1;

function _try(func, fallbackValue) {
	try {
		var value = func();
		return value === null || value === undefined ? fallbackValue : value;
	} catch (e) {
		return fallbackValue;
	}
}

const nightPDF = (function () {
	let ipcRenderer;
	let remote;
	let path;

	if (isBrowser) {
		//stubs for testing in browser directly
		ipcRenderer = {
			removeAllListeners: () => { },
			on: () => { }
		};
		remote = {};
		path = {
			parse: (file) => {
				return {
					base: file
				};
			}
		};
	} else {
		const { ipcRenderer: _ipcrenderer, remote: _remote } = require('electron');
		ipcRenderer = _ipcrenderer;
		remote = _remote;
		path = require('path');
	}

	var _pdfElement;
	var _headerElement;
	var _titleElement;
	var _menuElement;
	var _darkConfiguratorElement;
	var _brightnessSliderElement;
	var _grayscaleSliderElement;
	var _invertSliderElement;
	var _sepiaSliderElement;
	var _hueSliderElement;
	var _extraBrightnessSliderElement;
	var _splashElement;
	var _splashExtraElement;


	function main() {
		document.body.addEventListener('click', event => {
			if (event.target.tagName.toLowerCase() === 'a') {
				event.preventDefault();
				require("electron").shell.openExternal(event.target.href);
			}
		});
		_appContainerElement = document.getElementById('appContainer');
		_pdfElement = document.getElementById('pdfjs');
		_headerElement = document.getElementById('header');
		_titleElement = document.getElementById('title');
		_menuElement = document.getElementById('menu');
		_defaultButton = document.getElementById('default-button');
		_sepiaButton = document.getElementById('sepia-button');
		_redeyeButton = document.getElementById('redeye-button');
		_customButton = document.getElementById('custom-button');
		_darkConfiguratorElement = document.getElementById('darkConfigurator');
		_brightnessSliderElement = document.getElementById('brightnessSlider');
		_grayscaleSliderElement = document.getElementById('grayscaleSlider');
		_invertSliderElement = document.getElementById('invertSlider');
		_sepiaSliderElement = document.getElementById('sepiaSlider');
		_hueSliderElement = document.getElementById('hueSlider');
		_extraBrightnessSliderElement = document.getElementById('extraBrightnessSlider');
		_splashElement = document.getElementById('splash');
		_splashExtraElement = document.getElementById('splash-extra');

		//setup electron listeners
		ipcRenderer.removeAllListeners('file-open');
		ipcRenderer.on('file-open', (e, msg) => {
			console.log('que pex ' + Math.random());
			_openFile(msg);
		});

		ipcRenderer.removeAllListeners('file-print');
		ipcRenderer.on('file-print', (e, msg) => {
			_pdfElement.contentDocument.getElementById('print').dispatchEvent(new Event('click'));
		});

		// setup dom listeners
		_defaultButton.addEventListener('click', (e) => {
			// do default styling

			if (_defaultButton.className.includes('active')) {
				_toggleDarkConfigurator();
			} else {
				_defaultButton.className = "button active";
				_sepiaButton.className = "button";
				_redeyeButton.className = "button";
				_customButton.className = "button";
				_handlePresetChange('default');
			}

			e.stopPropagation();
		});
		_sepiaButton.addEventListener('click', (e) => {
			// do default styling
			if (_sepiaButton.className.includes('active')) {
				_toggleDarkConfigurator();
			} else {
				_defaultButton.className = "button";
				_sepiaButton.className = "button active";
				_redeyeButton.className = "button";
				_customButton.className = "button";
				_handlePresetChange('sepia');
			}
			e.stopPropagation();
		});
		_redeyeButton.addEventListener('click', (e) => {
			// do default styling
			// only display menu if active
			if (_redeyeButton.className.includes('active')) {
				_toggleDarkConfigurator();
			} else {
				_defaultButton.className = "button";
				_sepiaButton.className = "button";
				_redeyeButton.className = "button active";
				_customButton.className = "button";
				_handlePresetChange('redeye');
			}
			e.stopPropagation();
		});

		_customButton.addEventListener('click', (e) => {
			// do default styling
			// always display menu
			if (!_customButton.className.includes('active')) {
				_defaultButton.className = "button";
				_sepiaButton.className = "button";
				_redeyeButton.className = "button";
				_customButton.className = "button active";
				_handlePresetChange('original');
			}
			_toggleDarkConfigurator();
			e.stopPropagation();
		});

		_headerElement.addEventListener('click', (e) => {
			_hideDarkConfigurator();
		});

		_pdfElement.addEventListener('click', (e) => {
			_hideDarkConfigurator();
			e.stopPropagation();
		}, true
		);

		_splashElement.addEventListener('click', (e) => {
			ipcRenderer.send('openNewPDF', null);
		});

		_splashExtraElement.addEventListener('click', (e) => {
			ipcRenderer.send('openNewPDF', null);
		})

		window.addEventListener('blur', function () {
			if (document.activeElement.id == 'pdfjs') {
				_hideDarkConfigurator();
			}
		});

		_splashElement.ondrop = (e) => {
			console.log('files dropped');
			e.preventDefault();
			e.stopPropagation();

			const files = e.dataTransfer.files;

			if (!files || files.length === 0) {
				return;
			}

			const fileToOpen = files[0];
			_openFile(fileToOpen.path);
		};
		_splashElement.ondragover = (e) => {
			console.log('file dragged');
			e.preventDefault();
			e.stopPropagation();
		};

		if (navigator.userAgent.toLowerCase().indexOf(' electron/') == -1) {
			//_openFile('/Users/jllcabrera/Archive/Research Papers/junior08.pdf');
		}

	}

	const _toggleDarkConfigurator = () => {
		if (_darkConfiguratorElement.style.visibility === 'visible') {
			_darkConfiguratorElement.style.visibility = 'hidden';
		} else {
			_darkConfiguratorElement.style.visibility = 'visible';
		}
	};

	const _hideDarkConfigurator = () => {
		if (_darkConfiguratorElement.style.visibility === 'visible') {
			_darkConfiguratorElement.style.visibility = 'hidden';
		}
	};

	const _openFile = (file) => {
		console.log('opening ', file);
		if (_pdfElement.src) {
			console.log('opening in new window');
			ipcRenderer.send('newWindow', file);
		} else {
			_appContainerElement.style.zIndex = '1';
			_pdfElement.src = 'libs/pdfjs/web/viewer.html?file=' + encodeURIComponent(file) + '#pagemode=none';
			_pdfElement.onload = _fileDidLoad;
			_updateTitle(file);
			//send message to update window size
		}
	};

	const _fileDidLoad = () => {
		console.log('Loaded PDF');
		_headerElement.style.visibility = 'visible';
		ipcRenderer.send('togglePrinting', true);
		ipcRenderer.send('resizeWindow', null);
		_setupDarkMode();
		_setupSliders();
	};

	const _handlePresetChange = (preset) => {
		const brightness = _brightnessSliderElement.noUiSlider;
		const grayness = _grayscaleSliderElement.noUiSlider;
		const inversion = _invertSliderElement.noUiSlider;
		const sepia = _sepiaSliderElement.noUiSlider;
		const hue = _hueSliderElement.noUiSlider;
		const extraBrightness = _extraBrightnessSliderElement.noUiSlider;

		switch (preset) {
			case 'default':
				brightness.set(7);
				grayness.set(95);
				inversion.set(95);
				sepia.set(55);
				hue.set(180);
				extraBrightness.set(0);
				break;
			case 'original':
				brightness.set(0);
				grayness.set(0);
				inversion.set(0);
				sepia.set(0);
				hue.set(0);
				extraBrightness.set(0);
				break;
			case 'redeye':
				brightness.set(8);
				grayness.set(100);
				inversion.set(92);
				sepia.set(100);
				hue.set(295);
				extraBrightness.set(-6);
				break;
			case 'sepia':
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

		console.log(preset, 'changed');
	};

	const _setupSliders = () => {
		noUiSlider.create(_brightnessSliderElement, {
			start: 7,
			step: 1,
			connect: 'lower',
			range: {
				min: 0,
				max: 100
			},
			tooltips: [
				{
					// 'to' the formatted value. Receives a number.
					to: function (value) {
						return Math.round(value) + '%';
					},
					// 'from' the formatted value.
					// Receives a string, should return a number.
					from: function (value) {
						return Number(value.replace('%', ''));
					}
				}
			]
		});

		noUiSlider.create(_grayscaleSliderElement, {
			start: 95,
			step: 1,
			connect: 'lower',
			range: {
				min: 0,
				max: 100
			},
			tooltips: [
				{
					// 'to' the formatted value. Receives a number.
					to: function (value) {
						return Math.round(value) + '%';
					},
					// 'from' the formatted value.
					// Receives a string, should return a number.
					from: function (value) {
						return Number(value.replace('%', ''));
					}
				}
			]
		});

		noUiSlider.create(_invertSliderElement, {
			start: 95,
			step: 1,
			connect: 'lower',
			range: {
				min: 0,
				max: 100
			},
			tooltips: [
				{
					// 'to' the formatted value. Receives a number.
					to: function (value) {
						return Math.round(value) + '%';
					},
					// 'from' the formatted value.
					// Receives a string, should return a number.
					from: function (value) {
						return Number(value.replace('%', ''));
					}
				}
			]
		});

		noUiSlider.create(_sepiaSliderElement, {
			start: 55,
			step: 1,
			connect: 'lower',
			range: {
				min: 0,
				max: 100
			},
			tooltips: [
				{
					// 'to' the formatted value. Receives a number.
					to: function (value) {
						return Math.round(value) + '%';
					},
					// 'from' the formatted value.
					// Receives a string, should return a number.
					from: function (value) {
						return Number(value.replace('%', ''));
					}
				}
			]
		});

		noUiSlider.create(_hueSliderElement, {
			start: 180,
			step: 1,
			connect: 'lower',
			range: {
				min: 0,
				max: 360
			},
			tooltips: [
				{
					// 'to' the formatted value. Receives a number.
					to: function (value) {
						return Math.round(value) + '°';
					},
					// 'from' the formatted value.
					// Receives a string, should return a number.
					from: function (value) {
						return Number(value.replace('°', ''));
					}
				}
			]
		});

		noUiSlider.create(_extraBrightnessSliderElement, {
			start: 0,
			step: 1,
			connect: 'lower',
			range: {
				min: -100,
				max: 200
			},
			tooltips: [
				{
					// 'to' the formatted value. Receives a number.
					to: function (value) {
						return Math.round(value) + '%';
					},
					// 'from' the formatted value.
					// Receives a string, should return a number.
					from: function (value) {
						return Number(value.replace('%', ''));
					}
				}
			]
		});

		const sliders = [
			_brightnessSliderElement,
			_grayscaleSliderElement,
			_invertSliderElement,
			_sepiaSliderElement,
			_hueSliderElement,
			_extraBrightnessSliderElement
		];
		sliders.map((slider) => {
			const namespace = _brightnessSliderElement.id;
			const eventName = 'update.' + namespace;
			slider.noUiSlider.on(eventName, () => {
				updateCSS();
			});
		});
	};

	const _setupDarkMode = () => {
		var style = document.createElement('style');
		style.setAttribute('id', 'pageStyle');
		style.textContent = 'div#viewer .page {';
		style.textContent += 'filter: brightness(0.91) grayscale(0.95) invert(0.95) sepia(0.55) hue-rotate(180deg);';
		style.textContent += 'border-image: none;';
		style.textContent += '}';
		_pdfElement.contentDocument.head.appendChild(style);
	};

	_updateDarkSettings = (cssFilter) => {
		const currentStyle = _pdfElement.contentDocument.getElementById('pageStyle');

		let cssRule;
		cssRule = 'div#viewer .page {';
		cssRule += cssFilter;
		cssRule += 'border-image: none;';
		cssRule += '}';

		if (currentStyle) {
			currentStyle.innerHTML = cssRule;
		}
	};

	updateCSS = () => {
		const brightness = _try(() => _brightnessSliderElement.noUiSlider.get(), 0);
		const grayness = _try(() => _grayscaleSliderElement.noUiSlider.get(), 0);
		const inversion = _try(() => _invertSliderElement.noUiSlider.get(), 0);
		const sepia = _try(() => _sepiaSliderElement.noUiSlider.get(), 0);
		const hue = _try(() => _hueSliderElement.noUiSlider.get(), 0);
		const extraBrightness = _try(() => _extraBrightnessSliderElement.noUiSlider.get(), 0);

		console.log(extraBrightness);
		let cssRule = '';
		cssRule += 'filter: ';
		cssRule += 'brightness(' + (100 - brightness) / 100 + ') ';
		cssRule += 'grayscale(' + grayness / 100 + ') ';
		cssRule += 'invert(' + inversion / 100 + ') ';
		cssRule += 'sepia(' + sepia / 100 + ') ';
		cssRule += 'hue-rotate(' + hue + 'deg) ';
		cssRule += 'brightness(' + (Math.round(extraBrightness) + 100.0) / 100 + ');';

		console.log(cssRule);

		_updateDarkSettings(cssRule);
	};

	_updateTitle = (filePath) => {
		const fileName = path.parse(filePath).base;
		if (fileName) {
			_titleElement.innerHTML = fileName;
			document.title = fileName;
		} else {
			document.title = 'NightPDF';
		}
	};

	return {
		run: main
	};
})();

nightPDF.run();
