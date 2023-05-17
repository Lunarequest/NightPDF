import Store, { Schema } from "electron-store";
import { type JSONSchema } from "json-schema-typed";

interface NightPDFSettings extends JSONSchema {
	version: string;
	general: object;
	keybinds: {
		OpenWindow: string[];
		CloseWindow: string[];
	};
}

type Keybinds = {
	[key: string]: string[];
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
			OpenWindow: keybindPropertyDef(),
			CloseWindow: keybindPropertyDef(),
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
			OpenWindow: ["CommandOrControl+t"],
			CloseWindow: ["CommandOrControl+w", "CommandOrControl+F4"],
		},
	};
}

export {
	NightPDFSettings,
	nightpdf_schema,
	Keybinds,
	nightpdf_default_settings,
};
