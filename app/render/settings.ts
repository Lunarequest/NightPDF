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

import type { Keybinds, Keybind, ModifierKeyMap } from "../helpers/settings";
import {
	ModifierKeys,
	modifierToString,
	KeybindsHelper,
	KeybindHelper,
} from "../helpers/settings";

async function nightPDFSettings() {
	console.log("settings page loaded");

	// LHS menu
	const menu = document.getElementById("settings-menu");
	// RHS content
	const contentWrapper = document.getElementById("settings-content");
	// All settings/config
	const settings = await window.api.GetSettings();
	// All available modifiers (ctrl, alt, etc.)
	const availableModifiers = Object.keys(ModifierKeys);
	// How to display the currently pressed keys
	const keybindDisplayTemplate = (displayAs: string, key: string) => {
		return `<span class="keybind-modifier ${key} ${window.api.platform}">${displayAs}</span>`;
	};
	// All currently pressed keys (by name, not code i.e. "Control" not "ControlLeft")
	const heldKeys: Record<string, boolean> = {};
	// New keybind value, will be set to null if the keybind is invalid
	// invalid meaning: - keybind is already in use; - keybind is invalid (i.e. "Control" + "Alt")
	const newKeybind: Keybind = {
		modifiers: {},
		key: null,
	};

	// how to display the join between keys (i.e. " + ")
	const keybindJoinDisplay = '<span class="keybind-join"> + </span>';
	const invalidKeybindDisplay = '<span class="keybind-invalid">Invalid</span>';

	for (const setting in settings) {
		if (Object.prototype.hasOwnProperty.call(settings, setting)) {
			// add to menu
			const menuItem = document.createElement("div");
			const panelId = `settings-${setting}`;
			menuItem.classList.add("menu-item");
			menuItem.innerText = setting;
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

	const version = await window.api.GetVersion();
	const version_panel = document.getElementById("settings-version");

	if (version_panel) {
		version_panel.classList.remove("hidden");
		const div = document.createElement("div");
		div.classList.add("version");
		div.innerHTML = version;
		version_panel.appendChild(div);
	}

	const keybinds = new KeybindsHelper(settings.keybinds, window.api.platform);
	const panel = document.getElementById("settings-keybinds");

	const resetNewKeyBind = () => {
		newKeybind.key = null;
		newKeybind.modifiers = {};
	};

	const hideOverlay = () => {
		const keyDisplay = document.getElementById("keybind-overlay-key");
		const keybindOverlay = document.getElementById("keybind-overlay");
		resetNewKeyBind();
		if (keyDisplay) {
			keyDisplay.innerHTML = "";
		}
		// remove window event listeners
		window.removeEventListener("keydown", overlayKeybindCapture);
		window.removeEventListener("keyup", overlayKeybindCaptureUp);
		if (!keybindOverlay) {
			return;
		}
		keybindOverlay.classList.add("hidden");
		// remove all event listeners
		const newOverlay = keybindOverlay.cloneNode(true);
		if (keybindOverlay && newOverlay) {
			keybindOverlay.parentNode?.replaceChild(newOverlay, keybindOverlay);
		}
		// remove settings page event listener
		const settingsPage = document.getElementById("settings-page");
		settingsPage?.removeEventListener("click", hideOverlayOnClick);
		// set any held keys to false
		for (const key in heldKeys) {
			heldKeys[key] = false;
		}
	};

	const hideOverlayOnClick = (e: MouseEvent): void => {
		const keybindOverlay = document.getElementById("keybind-overlay");
		// if the overlay is not clicked we might be able to hide it
		if (e.target !== keybindOverlay) {
			// if the target is a child of the overlay we shouldn't hide it
			if (keybindOverlay?.contains(e.target as Node)) {
				return;
			}
			e.preventDefault();
			e.stopPropagation();
			hideOverlay();
			return;
		}
	};

	const overlayKeybindCapture = (e: KeyboardEvent): void => {
		if (heldKeys[e.key]) {
			return;
		}
		if (e.key === "Escape") {
			e.preventDefault();
			e.stopPropagation();
			hideOverlay();
			return;
		}
		heldKeys[e.key] = true;
		console.log("key pressed", e.key);
		if (updateKeybindDisplay()) {
			e.preventDefault();
			e.stopPropagation();
		}
	};

	/**
	 * Updates what's currently being pressed in the keybind overlay
	 * @returns true if the keybind was updated, false otherwise (e.g. only Ctrl is pressed)
	 */
	const updateKeybindDisplay = (): boolean => {
		const keyDisplay = document.getElementById("keybind-overlay-key");
		if (!keyDisplay) {
			resetNewKeyBind();
			return false;
		}
		// which keys are currently held
		const currentlyHeldKeys = Object.keys(heldKeys).filter(
			(key) => heldKeys[key],
		);
		// if there are no keys, return false
		if (currentlyHeldKeys.length === 0) {
			keyDisplay.innerHTML = "";
			resetNewKeyBind();
			return false;
		}
		// which of those are modifiers
		const currentlyHeldModifiers = currentlyHeldKeys.filter((key) =>
			availableModifiers.includes(key),
		);
		// if there are more than one normal key, return false
		if (currentlyHeldKeys.length - currentlyHeldModifiers.length > 1) {
			keyDisplay.innerHTML = invalidKeybindDisplay;
			resetNewKeyBind();
			return false;
		}
		// The normal key that is currently held
		const currentlyHeldNormal = currentlyHeldKeys.filter(
			(key) => !availableModifiers.includes(key),
		)[0];
		// if there are no modifiers, return false
		if (currentlyHeldModifiers.length === 0) {
			keyDisplay.innerHTML = "";
			resetNewKeyBind();
			return false;
		}

		// otherwise, display the modifiers
		const keybindDisplay = currentlyHeldModifiers
			.flatMap((name) => {
				const displayAs = modifierToString(name, window.api.platform);
				return keybindDisplayTemplate(displayAs, name);
			})
			.filter((v) => v !== null)
			.join(keybindJoinDisplay);
		// If there are only modifiers, we show them but don't update the new keybind
		if (currentlyHeldKeys.length === currentlyHeldModifiers.length) {
			keyDisplay.innerHTML = keybindDisplay + keybindJoinDisplay;
			resetNewKeyBind();
			return false;
		}
		// otherwise, show the key and update the new keybind
		newKeybind.key = currentlyHeldNormal;
		const modifiers: ModifierKeyMap = {};
		while (currentlyHeldModifiers.length) {
			const modifier = currentlyHeldModifiers.pop();
			if (!modifier) {
				continue;
			}
			modifiers[modifier] = ModifierKeys[modifier];
		}
		newKeybind.modifiers = modifiers;
		keyDisplay.innerHTML = `${keybindDisplay}${keybindJoinDisplay}<span class=\"keybind-key\">${currentlyHeldNormal}</span>`;
		return true;
	};

	const overlayKeybindCaptureUp = (e: KeyboardEvent): void => {
		// if the held key is the only one left and it's a modifier, then we should
		// clear the display
		heldKeys[e.key] = false;

		// we might need to do some logic here to handle a modifier being released
		// but I would suggest just letting them press a new combination from scratch
		// rather than trying to determine what they meant to do
	};

	/**
	 *
	 * @param targetKeybind The keybind to edit
	 * @param bindIndex The index of the keybind to edit (usually 0 or 1 for primary and secondary)
	 * @param e The click event
	 */
	const showOverlay = (
		key: string,
		targetKeybind: KeybindHelper,
		bindIndex: number,
		e: MouseEvent,
	) => {
		e.preventDefault();
		e.stopPropagation();
		const keybindOverlay = document.getElementById("keybind-overlay");
		keybindOverlay?.classList.remove("hidden");
		// add event listeners for handling keybinds + escape to cancel
		window.addEventListener("keydown", overlayKeybindCapture);
		window.addEventListener("keyup", overlayKeybindCaptureUp);
		const settingsPage = document.getElementById("settings-page");
		settingsPage?.addEventListener("click", hideOverlayOnClick);
		// add event listener to cancel button
		const cancelButton = document.getElementById("keybind-overlay-cancel");
		const saveButton = document.getElementById("keybind-overlay-save");
		cancelButton?.addEventListener(
			"click",
			() => {
				hideOverlay();
			},
			{ once: true },
		);

		// @todo: add event listener to save button, check for duplicates
		saveButton?.addEventListener(
			"click",
			() => {
				const values = document.getElementById(
					"keybind-overlay-key",
				)?.innerText;
				if (!values) {
					alert("Invalid keybind");
					return;
				}
				const updatedKeybind = keybinds.updateActionKeybind(
					key,
					bindIndex,
					newKeybind,
				);
				window.api.SetBind(key, updatedKeybind);
				const kbWrap = document.getElementById(`${key}-${bindIndex}`);
				const newKeybindDisplay = createKeybindSetting(
					key,
					keybinds.getActionKeybinds(key),
					bindIndex,
				);
				kbWrap?.replaceWith(newKeybindDisplay.kbWrap);

				hideOverlay();
			},
			{ once: true },
		);
	};

	const createKeybindSetting = (
		key: string,
		keybind: KeybindHelper[],
		bindIndex: number,
	): { title: HTMLLabelElement; kbWrap: HTMLElement } => {
		const elementName = `${key}-${bindIndex}`;
		const which = bindIndex === 0 ? "primary" : "secondary";
		const currentBind: KeybindHelper | null = keybind[bindIndex]
			? keybind[bindIndex]
			: null;
		const title = document.createElement("label");

		title.htmlFor = elementName;
		title.classList.add("setting-name", "keybind-name");
		title.innerText = keybinds.getActionDisplayName(key);

		// keybind
		const kbWrap = document.createElement("div");
		kbWrap.classList.add("setting-value", which);
		if (!currentBind) {
			return { title, kbWrap };
		}
		kbWrap.id = `${key}-${bindIndex}`;
		const keybindParts = currentBind.toStringArray();
		const keybindKey = keybindParts.pop();
		for (const modifier of currentBind.getModifierKeys()) {
			const modifierSpan = document.createElement("span");
			modifierSpan.classList.add(
				"keybind-modifier",
				window.api.platform,
				modifier.savesAs,
			);
			modifierSpan.innerText = modifierToString(
				modifier.savesAs,
				window.api.platform,
			);

			kbWrap.appendChild(modifierSpan);
			// add span with '+'
			const plusSpan = document.createElement("span");
			plusSpan.classList.add("keybind-join");
			plusSpan.innerText = "+";
			kbWrap.appendChild(plusSpan);
		}

		kbWrap.addEventListener(
			"click",
			showOverlay.bind(null, key, keybind[bindIndex], bindIndex),
		);

		const keySpan = document.createElement("span");
		keySpan.classList.add("keybind-key");
		keySpan.innerText = currentBind.getKey() ?? "";
		kbWrap.appendChild(keySpan);

		return { title, kbWrap };
	};

	for (const action of keybinds.actions) {
		console.log(action);
		if (panel) {
			const primaryBindSetting = createKeybindSetting(
				action,
				keybinds.getActionKeybinds(action),
				0,
			);
			const secondaryBindSetting = createKeybindSetting(
				action,
				keybinds.getActionKeybinds(action),
				1,
			);
			const settingsItem = document.createElement("div");
			settingsItem.classList.add("settings-item", "keybind-item");
			settingsItem.appendChild(primaryBindSetting.title);
			settingsItem.appendChild(primaryBindSetting.kbWrap);
			settingsItem.appendChild(secondaryBindSetting.kbWrap);

			panel.appendChild(settingsItem);
		}
	}
}

nightPDFSettings();

export default nightPDFSettings;
