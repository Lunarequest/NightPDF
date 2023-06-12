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
	const panel = document.getElementById("settings-content");
	const settings = await window.api.GetSettings();
	console.log(settings);
	for (const key in settings) {
		if (Object.prototype.hasOwnProperty.call(settings, key)) {
			// add to menu
			// const element = settings[key];
			const menuItem = document.createElement("div");
			menuItem.classList.add("menu-item");
			menuItem.innerText = key;
			menuItem.addEventListener("click", () => {
				// hide all panels
				for (const panel of document.getElementsByClassName("settings-panel")) {
					panel.classList.add("hidden");
				}
				// show current panel
				document.getElementById(key)?.classList.remove("hidden");
			});
			menu?.appendChild(menuItem);
		}
	}

	const keybinds = settings.keybinds;
	for (const key in keybinds) {
		if (Object.prototype.hasOwnProperty.call(keybinds, key)) {
			if (panel) {
				const element = keybinds[key];
				panel.classList.add("settings-panel");
				panel.id = key;
				panel.classList.add("hidden");
				const title = document.createElement("h1");
				title.innerText = key;
				panel.appendChild(title);
				const input = document.createElement("input");
				input.value = element.trigger.toString();
				input.addEventListener("keydown", (e) => {
					e.preventDefault();
					e.stopPropagation();
					input.value = e.key;
					window.api.SetBind(key, e.key);
				});
				panel.appendChild(input);
			}
		}
	}
}

nightPDFSettings();

export default nightPDFSettings;
