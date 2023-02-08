# NightPDF

Dark Mode PDF reader

It uses Electron but my eyes dont care.


![NightPDF screencast](docs/nightpdf.gif?raw=true)

## Download Binaries

![NightPDF logo](docs/nightpdf_small.png?raw=true)

Binaries for Linux and Windows

-   [Latest release](https://github.com/Lunarequest/NightPDF/releases/latest)

## Limitations

There is limited support for xfa forms, and saving forms with filled in data. This will be worked on with coming releases.

## Development

### Requirements

This software was developed using

-   node: v19.x
-   yarn: v1.x
-   Arch Linux Rolling/OpenSUSE Tumbleweed

## Instructions

1. Install dependencies

```bash
yarn
```

2. Run

```bash
yarn dev
```

### Building Release Version

1. Install dependencies

```bash
yarn
```

2. Build release

```bash
yarn dist
```

## Licenses

-   [NightPDF](https://github.com/advaithm/NightPDF) is under [GPLv2 only](LICENSE)
-   [Electron](https://github.com/electron/electron) is under [MIT](https://github.com/electron/electron/blob/master/LICENSE)
-   [PDF.js](https://mozilla.github.io/pdf.js/) is under [Apache License 2.0](https://github.com/mozilla/pdf.js/blob/master/LICENSE)
