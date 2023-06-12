import { Schema } from "electron-store";
import { type JSONSchema } from "json-schema-typed";

interface NightPDFSettings extends JSONSchema {
	version: string;
	general: object;
	keybinds: Record<string, Keybinds>;
}

type Keybinds = {
	trigger: string[];
	readonly action: string;
	readonly data: string | undefined;
	readonly displayName: string | undefined;
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

export {
	NightPDFSettings,
	nightpdf_schema,
	Keybinds,
	nightpdf_default_settings,
};
