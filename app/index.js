const nightPDF = (function() {
	const { ipcRenderer, remote } = require('electron');
	let noUiSlider = require('nouislider');
	window.noUiSlider = noUiSlider;

	const path = require('path');

	var _pdfElement;
	var _headerElement;
	var _titleElement;
	var _menuElement;
	var _darkConfiguratorElement;
	var _darkCSSElement;
	var _brightnessSliderElement;
	var _grayscaleSliderElement;

	function main() {
		_pdfElement = document.getElementById('pdfjs');
		_headerElement = document.getElementById('header');
		_titleElement = document.getElementById('title');
		_menuElement = document.getElementById('menu');
		_darkConfiguratorElement = document.getElementById('darkConfigurator');
		_darkCSSElement = document.getElementById('darkCSS');
		_brightnessSliderElement = document.getElementById('brightnessSlider');
		_grayscaleSliderElement = document.getElementById('grayscaleSlider');

		//setup listeners
		ipcRenderer.removeAllListeners('file-open');
		ipcRenderer.on('file-open', (e, msg) => {
			console.log('que pex ' + Math.random());
			_openFile(msg);
		});

		ipcRenderer.removeAllListeners('file-print');
		ipcRenderer.on('file-print', (e, msg) => {
			_pdfElement.contentDocument.getElementById('print').dispatchEvent(new Event('click'));
		});

		//setup header
		_menuElement.addEventListener('click', (e) => {
			if (_darkConfiguratorElement.style.visibility === 'visible') {
				_darkConfiguratorElement.style.visibility = 'hidden';
			} else {
				_darkConfiguratorElement.style.visibility = 'visible';
			}
		});
		_darkCSSElement.addEventListener('input', (event) => {
			_updateDarkSettings(event.target.value);
		});

		//setup slider
		const sliders = [ _brightnessSliderElement, _grayscaleSliderElement ];
		sliders.map((slider) => {
			noUiSlider.create(slider, {
				start: 50,
				connect: 'lower',
				range: {
					min: 0,
					max: 100
				}
			});
			const namespace = slider.id;
			const eventName = 'update.' + namespace;
			slider.noUiSlider.on(eventName, (e, h, u, t, p, n) => {
				updateCSS(n);
			});
		});
	}

	const _openFile = (file) => {
		console.log('opening ', file);
		if (_pdfElement.src) {
			console.log('opening in new window');
			ipcRenderer.send('newWindow', file);
		} else {
			_pdfElement.src = 'libs/pdfjs/web/viewer.html?file=' + encodeURIComponent(file);
			_pdfElement.onload = _fileDidLoad;
			_updateTitle(file);
		}
	};

	const _fileDidLoad = () => {
		console.log('Loaded PDF');
		_headerElement.style.visibility = 'visible';
		_setupDarkMode();
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

		currentStyle.innerHTML = cssRule;
	};

	updateCSS = (nouislider) => {
		const target = nouislider.target.id;
		const value = nouislider.target.noUiSlider.get();

		console.log(target, value);
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
