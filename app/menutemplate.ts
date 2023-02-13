import type { MenuItemConstructorOptions } from 'electron';
import { shell } from 'electron';

function createMenu() {
    const menuTemplate: MenuItemConstructorOptions[] = [];
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
        },
        {
            role: 'help',
            submenu: [
                {
                    label: 'Learn More',
                    click: async () => {
                        await shell.openExternal(
                            'https://github.com/Lunarequest/NightPDF#readme'
                        );
                    },
                },
                {
                    label: 'License',
                    click: async () => {
                        await shell.openExternal(
                            'https://github.com/Lunarequest/NightPDF/blob/mistress/LICENSE'
                        );
                    },
                },
            ],
        }
    );
    return menuTemplate;
}
export default { createMenu };
