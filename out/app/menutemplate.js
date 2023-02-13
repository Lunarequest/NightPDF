"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
function createMenu() {
    const menuTemplate = [];
    menuTemplate.push(
    // { role: 'fileMenu' }
    {
        label: 'File',
        submenu: [
            {
                label: 'Open...',
                id: 'file-open',
                accelerator: 'CmdOrCtrl+O',
            },
            {
                label: 'Print',
                id: 'file-print',
                accelerator: 'CmdOrCtrl+P',
                enabled: false,
            },
        ],
    }, 
    // { role: 'editMenu' }
    {
        label: 'Edit',
        submenu: [
            { role: 'undo' },
            { role: 'redo' },
            { type: 'separator' },
            { role: 'cut' },
            { role: 'copy' },
            { role: 'paste' },
        ],
    }, 
    // { role: 'viewMenu' }
    {
        label: 'View',
        submenu: [
            { role: 'resetZoom' },
            { role: 'zoomIn' },
            { role: 'zoomOut' },
            { type: 'separator' },
            { role: 'togglefullscreen' },
        ],
    }, 
    // { role: 'windowMenu' }
    {
        label: 'Window',
        submenu: [{ role: 'minimize' }],
    }, {
        role: 'help',
        submenu: [
            {
                label: 'Learn More',
                click: () => __awaiter(this, void 0, void 0, function* () {
                    yield electron_1.shell.openExternal('https://github.com/Lunarequest/NightPDF#readme');
                }),
            },
            {
                label: 'License',
                click: () => __awaiter(this, void 0, void 0, function* () {
                    yield electron_1.shell.openExternal('https://github.com/Lunarequest/NightPDF/blob/mistress/LICENSE');
                }),
            },
        ],
    });
    return menuTemplate;
}
exports.default = { createMenu };
