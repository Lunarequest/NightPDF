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

function keybindPropertyDef(init: string[], min = 1, max = 2): JSONSchema {
	return {
		type: "array",
		items: {
			type: "string",
		},
		default: init,
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
				default: false,
			},
		},
		type: "object",
	},
	keybinds: {
		properties: {
			OpenWindow: keybindPropertyDef(["CommandOrControl+t"]),
			CloseWindow: keybindPropertyDef([
				"CommandOrControl+w",
				"CommandOrControl+F4",
			]),
		},
		type: "object",
	},
};

export { NightPDFSettings, nightpdf_schema, Keybinds };
