/*
NightPDF Dark mode for Pdfs    
Copyright (C) 2021  Advaith Madhukar

This program is free software; you can redistribute it and/or
modify it under the terms of the GNU General Public License
as published by the Free Software Foundation; version 2
of the License.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program; if not, write to the Free Software
Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
*/
//trans rights

async function nightPDFSettings() {
	console.log("loading");
	console.log("settings page loaded");
	//const container = document.getElementById("settings-panel");
	const menu = document.getElementById("settings-menu");
	const contentWrapper = document.getElementById("settings-content");
	const settings = await window.api.GetSettings();
	console.log(settings);
	for (const key in settings) {
		if (Object.prototype.hasOwnProperty.call(settings, key)) {
			// add to menu
			// const element = settings[key];
			const menuItem = document.createElement("div");
			const panelId = `settings-${key}`;
			menuItem.classList.add("menu-item");
			menuItem.innerText = key;
			menuItem.addEventListener("click", () => {
				for (const panel of document.getElementsByClassName("menu-item")) {
					panel.classList.remove("active");
				}
				menuItem.classList.add("active");
				// hide all panels
				for (const panel of document.getElementsByClassName("settings-panel")) {
					panel.classList.add("hidden");
				}
				// show current panel
				document.getElementById(panelId)?.classList.remove("hidden");
			});
			menu?.appendChild(menuItem);
			const panel = document.createElement("div");
			panel.classList.add("settings-panel", "hidden");
			panel.id = panelId;
			contentWrapper?.appendChild(panel);
		}
	}

	const keybinds = settings.keybinds;
	const panel = document.getElementById("settings-keybinds");
	for (const key in keybinds) {
		if (Object.prototype.hasOwnProperty.call(keybinds, key)) {
			if (panel) {
				const settingsItem = document.createElement("div");
				settingsItem.classList.add("settings-item", "keybind-item");
				const keybind = keybinds[key];
				const title = document.createElement("label");
				title.htmlFor = key;
				title.classList.add("setting-name", "keybind-name");
				title.innerText = keybind.displayName ?? key;
				settingsItem.appendChild(title);
				const input = document.createElement("input");
				input.classList.add("setting-input", "keybind-input");
				input.name = key;
				input.value = keybind.trigger.toString();
				input.addEventListener("keydown", (e) => {
					e.preventDefault();
					e.stopPropagation();
					input.value = e.key;
					// save later
					// window.api.SetBind(key, e.key);
				});
				settingsItem.appendChild(input);
				panel.appendChild(settingsItem);
			}
		}
	}
}

nightPDFSettings();

export default nightPDFSettings;
