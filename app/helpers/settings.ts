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
				},
				type: "object",
			},
			CloseWindow: {
				properties: {
					trigger: keybindPropertyDef(),
					action: {
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
			MaximizeOnOpen: false,
		},
		keybinds: {
			OpenWindow: {
				trigger: ["CommandOrControl+t"],
				action: "openNewPDF",
			},
			CloseWindow: {
				trigger: ["CommandOrControl+w", "CommandOrControl+F4"],
				action: "close-tab",
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
