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

const nightPDFSettings = (async function () {
	console.log("loading");

	async function main() {
		console.log("settings page loaded");
		const container = document.getElementById("settings-content");
		if (container) {
			container.innerHTML = "Hello!!";
		}
	}

	return {
		run: main,
	};
})();

const s = await nightPDFSettings;
s.run();

export default nightPDFSettings;
