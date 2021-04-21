# NightPDF

Dark Mode PDF reader

It uses Electron but my eyes dont care.

This is a fork of [eleloya/NightPDF](https://github.com/eleloya/NightPDF) which is no longer maintained by eleloya. I sadly can not build or support Mac os directly. All prs realated to Macos will be accepted


![NightPDF screencast](docs/nightpdf.gif?raw=true)

## Download Binaries

![NightPDF logo](docs/nightpdf_small.png?raw=true)

Binaries for Linux and Windows

- [Latest release](https://github.com/advaithm/NightPDF/releases/latest)

## Limitations
Currently NightPDF does not support javascript forms in pdfs. if you attempt to load one it will not render.</br>
As soon as pdf.js supports this(hopefully the next stable release) NightPDF will support this

## Development

### Requirements

This software was developed using
- node: v15.14.0
- npm: 7.10.0
- Arch Linux Rolling

## Instructions

1. Install dependencies
```bash
npm install
```
2. Run
```bash
npm start
```
### Building Release Version

1. Install dependencies
```bash
npm install
```

2. Build release
```bash
npm run dist
```


## Licenses

- [NightPDF](https://github.com/advaithm/NightPDF) is under [WTFPL](LICENSE)
- [Electron](https://github.com/electron/electron) is under [MIT](https://github.com/electron/electron/blob/master/LICENSE)
- [PDF.js](https://mozilla.github.io/pdf.js/) is under [Apache License 2.0](https://github.com/mozilla/pdf.js/blob/master/LICENSE)
