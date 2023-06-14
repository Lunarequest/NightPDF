import { Schema } from "electron-store";
import { type JSONSchema } from "json-schema-typed";

type NightPDFSettings = JSONSchema & {
	version: string;
	general: object;
	keybinds: Record<string, Keybinds>;
};

// kebind config
type Keybinds = {
	trigger: string[];
	readonly action: string;
	readonly data?: string;
	readonly displayName?: string;
};

// to use in settings save/display
type Keybind = {
	modifiers: ModifierKeyMap;
	key: string | null;
};

// Modifier key definition (for keybinds)
type ModifierKey = {
	savesAs: string;
	osDependent: boolean;
	displayAs?: string;
	osVariants?: {
		[key: string]: string;
		default: string;
	};
};

// A collection of modifier keys
type ModifierKeyMap = {
	[modifierKey: string]: ModifierKey;
};

function keybindPropertyDef(min = 1, max = 2): JSONSchema {
	return {
		properties: {
			trigger: {
				type: "array",
				items: {
					type: "string",
				},
				minItems: min,
				maxItems: max,
			},
			action: {
				type: "string",
			},
			data: {
				type: "string",
			},
			displayName: {
				type: "string",
			},
		},
		type: "object",
		required: ["trigger", "action"],
	};
}

const nightpdf_schema: Schema<NightPDFSettings> = {
	version: {
		type: "string",
	},
	general: {
		properties: {
			MaximizeOnOpen: {
				type: "boolean",
			},
		},
		type: "object",
	},
	keybinds: {
		properties: {
			OpenWindow: keybindPropertyDef(),
			CloseWindow: keybindPropertyDef(),
			ReOpen: keybindPropertyDef(),
			SwitchTab: keybindPropertyDef(),
			PreviousTab: keybindPropertyDef(),
			LeftTab: keybindPropertyDef(),
			RightTab: keybindPropertyDef(),
			StartTab: keybindPropertyDef(),
			EndTab: keybindPropertyDef(),
		},
		type: "object",
	},
};

function nightpdf_default_settings(version: string): NightPDFSettings {
	return {
		version: version,
		general: {
			MaximizeOnOpen: true,
		},
		keybinds: {
			OpenWindow: {
				trigger: ["CommandOrControl+t"],
				action: "openNewPDF",
				displayName: "Open New PDF",
			},
			CloseWindow: {
				trigger: ["CommandOrControl+w", "CommandOrControl+F4"],
				action: "close-tab",
				displayName: "Close Tab",
			},
			ReOpen: {
				trigger: ["CommandOrControl+Shift+t"],
				action: "reopen-tab",
				displayName: "Reopen Tab",
			},
			SwitchTab: {
				trigger: ["CommandOrControl+Tab", "CommandOrControl+PageDown"],
				action: "switch-tab",
				data: "next",
				displayName: "Switch Tab",
			},
			PreviousTab: {
				trigger: ["CommandOrControl+Shift+Tab", "CommandOrControl+PageUp"],
				action: "switch-tab",
				data: "prev",
				displayName: "Previous Tab",
			},
			LeftTab: {
				trigger: ["CommandOrControl+Shift+PageUp"],
				action: "move-tab",
				data: "prev",
				displayName: "Move Tab Left",
			},
			RightTab: {
				trigger: ["CommandOrControl+Shift+PageDown"],
				action: "move-tab",
				data: "next",
				displayName: "Move Tab Right",
			},
			StartTab: {
				trigger: ["CommandOrControl+Shift+Home"],
				action: "move-tab",
				data: "start",
				displayName: "Move Tab to Start",
			},
			EndTab: {
				trigger: ["CommandOrControl+Shift+End"],
				action: "move-tab",
				data: "end",
				displayName: "Move Tab to End",
			},
		},
	};
}

// The modifier keys allowed in NightPDF
const ModifierKeys: ModifierKeyMap = {
	Control: {
		savesAs: "Control",
		osDependent: false,
		displayAs: "Ctrl",
	},
	Meta: {
		savesAs: "Meta",
		osDependent: true,
		osVariants: {
			darwin: "⌘",
			win32: "Win",
			default: "Meta",
		},
	},
	Alt: {
		savesAs: "Alt",
		osDependent: false,
	},
	AltGraph: {
		savesAs: "AltGraph",
		osDependent: false,
		displayAs: "AltGr",
	},
	Shift: {
		savesAs: "Shift",
		osDependent: false,
	},
};

function modifierToString(name: string, platform: string): string {
	const modifier = ModifierKeys[name];
	const displayAs =
		!modifier.osDependent || !modifier.osVariants
			? "displayAs" in modifier
				? modifier.displayAs
				: name
			: platform in modifier.osVariants
			? modifier.osVariants[platform]
			: modifier.osVariants?.["default"];
	return displayAs ?? name;
}

// This is to store the trigger keybinds in the settings file
// the savesAs property is what it should be stored as
function keybindToTrigger(keybind: Keybind): string {
	let trigger = "";
	if (keybind.modifiers) {
		for (const modifier in keybind.modifiers) {
			if (keybind.modifiers[modifier]) {
				trigger += `${ModifierKeys[modifier].savesAs}+`;
			}
		}
	}
	trigger += keybind.key;
	return trigger;
}

function keybindToString(keybind: Keybind, platform: string): string {
	let keybindString = "";
	if (keybind.key === null) {
		return keybindString;
	}
	if (keybind.modifiers) {
		for (const modifier in keybind.modifiers) {
			keybindString += modifierToString(modifier, platform);
			keybindString += "+";
		}
	}
	keybindString += keybind.key;
	return keybindString;
}

// This is to convert the trigger keybinds from the settings file
// to the format that is used by the keybinds
function triggerToKeybind(trigger: string, platform: string): Keybind {
	const keybind: Keybind = {
		key: "",
		modifiers: {},
	};
	const keys = trigger.split("+");
	// last key is the non-modifier key
	keybind.key = keys.pop() ?? "";
	for (const key of keys) {
		if (key === "CommandOrControl") {
			if (platform === "darwin") {
				keybind.modifiers["Meta"] = ModifierKeys["Meta"];
				continue;
			}
			keybind.modifiers["Control"] = ModifierKeys["Control"];
			continue;
		}
		keybind.modifiers[key] = ModifierKeys[key];
	}
	return keybind;
}

export {
	NightPDFSettings,
	nightpdf_schema,
	Keybind,
	Keybinds,
	ModifierKeyMap,
	ModifierKeys,
	nightpdf_default_settings,
	modifierToString as getModifierDisplayAs,
	keybindToTrigger,
	keybindToString,
	triggerToKeybind,
};
