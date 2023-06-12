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
	readonly data: null | string;
};

function keybindPropertyDef(min = 1, max = 2): JSONSchema {
	return {
		type: "array",
		items: {
			type: "string",
		},
		minItems: min,
		maxItems: max,
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
			OpenWindow: {
				properties: {
					trigger: keybindPropertyDef(),
					action: {
						type: "string",
					},
					data: {
						type: "null",
					},
				},
				type: "object",
			},
			CloseWindow: {
				properties: {
					trigger: keybindPropertyDef(),
					action: {
						type: "string",
					},
					data: {
						type: "null",
					},
				},
				type: "object",
			},
			ReOpen: {
				properties: {
					trigger: keybindPropertyDef(),
					action: {
						type: "string",
					},
					data: {
						type: "null",
					},
				},
				type: "object",
			},
			SwitchTab: {
				properties: {
					trigger: keybindPropertyDef(),
					action: {
						type: "string",
					},
					data: {
						type: "string",
					},
				},
				type: "object",
			},
			PreviousTab: {
				properties: {
					trigger: keybindPropertyDef(),
					action: {
						type: "string",
					},
					data: {
						type: "string",
					},
				},
				type: "object",
			},
			LeftTab: {
				properties: {
					trigger: keybindPropertyDef(),
					action: {
						type: "string",
					},
					data: {
						type: "string",
					},
				},
				type: "object",
			},
			RightTab: {
				properties: {
					trigger: keybindPropertyDef(),
					action: {
						type: "string",
					},
					data: {
						type: "string",
					},
				},
				type: "object",
			},
			StartTab: {
				properties: {
					trigger: keybindPropertyDef(),
					action: {
						type: "string",
					},
					data: {
						type: "string",
					},
				},
				type: "object",
			},
			EndTab: {
				properties: {
					trigger: keybindPropertyDef(),
					action: {
						type: "string",
					},
					data: {
						type: "string",
					},
				},
				type: "object",
			},
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
				data: null,
			},
			CloseWindow: {
				trigger: ["CommandOrControl+w", "CommandOrControl+F4"],
				action: "close-tab",
				data: null,
			},
			ReOpen: {
				trigger: ["CommandOrControl+Shift+t"],
				action: "reopen-tab",
				data: null,
			},
			SwitchTab: {
				trigger: ["CommandOrControl+Tab", "CommandOrControl+PageDown"],
				action: "switch-tab",
				data: "next",
			},
			PreviousTab: {
				trigger: ["CommandOrControl+Shift+Tab", "CommandOrControl+PageUp"],
				action: "switch-tab",
				data: "prev",
			},
			LeftTab: {
				trigger: ["CommandOrControl+Shift+PageUp"],
				action: "move-tab",
				data: "prev",
			},
			RightTab: {
				trigger: ["CommandOrControl+Shift+PageDown"],
				action: "move-tab",
				data: "next",
			},
			StartTab: {
				trigger: ["CommandOrControl+Shift+Home"],
				action: "move-tab",
				data: "start",
			},
			EndTab: {
				trigger: ["CommandOrControl+Shift+End"],
				action: "move-tab",
				data: "end",
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
