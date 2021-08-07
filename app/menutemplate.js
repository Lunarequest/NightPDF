'use strict';
/*------------------------------------------------------------------------------
 *  Copyright (c) 2019 Sagar Gurtu
 *  Licensed under the MIT License.
 *  See License in the project root for license information.
 *----------------------------------------------------------------------------*/
const { shell } = require('electron');

exports.menuTemplate = [
    // { role: 'fileMenu' }
    {
        label: 'File',
        submenu: [
            { label: 'Open...', id: 'file-open', accelerator: 'CmdOrCtrl+O' },
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
            { role: 'resetzoom' },
            { role: 'zoomin' },
            { role: 'zoomout' },
            { type: 'separator' },
            { role: 'togglefullscreen' },
        ],
    },
    // { role: 'windowMenu' }
    {
        label: 'Window',
        submenu: [{ role: 'minimize' }, { role: 'maximize' }],
    },
    {
        role: 'help',
        submenu: [
            {
                label: 'Learn More',
                click: async () => {
                    await shell.openExternal(
                        'https://github.com/advaithm/NightPDF#readme'
                    );
                },
            },
            {
                label: 'License',
                click: async () => {
                    await shell.openExternal(
                        'https://github.com/advaithm/NightPDF/blob/mistress/LICENSE'
                    );
                },
            },
        ],
    },
];
