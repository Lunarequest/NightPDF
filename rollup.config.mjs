import { rollupPluginHTML as html } from "@web/rollup-plugin-html";
import { swc, defineRollupSwcOption } from "rollup-plugin-swc3";
import copy from "rollup-plugin-copy";

export default [
	{
		input: ["app/main/menutemplate.ts", "app/main/app.ts"],
		external: ["electron", "path", "electron-updater"],
		output: [
			{
				dir: "./out/main/",
				format: "cjs",
				minifyInternalExports: true,
			},
		],
		plugins: [
			swc(
				defineRollupSwcOption({
					minify: true,
				}),
			),
		],
	},
	{
		input: "app/preload/preload.ts",
		external: ["electron"],
		output: [
			{
				file: "./out/preload/preload.js",
				format: "cjs",
				minifyInternalExports: true,
			},
		],
		plugins: [
			swc(
				defineRollupSwcOption({
					outputPath: "out",
					minify: true,
				}),
			),
		],
	},
	{
		input: "./app/render/index.ts",
		output: {
			file: "./out/index/index.js",
			format: "iife",
			minifyInternalExports: true,
			globals: {
				nouislider: "noUiSlider",
			},
		},
		external: ["nouislider"],
		plugins: [
			swc(
				defineRollupSwcOption({
					module: {
						type: "es6",
					},
					minify: true,
				}),
			),
		],
	},
	{
		input: "app/index.html",
		output: {
			dir: "out",
			minifyInternalExports: true,
		},
		plugins: [
			html(),
			copy({
				targets: [
					{ src: "app/libs/*", dest: "out/libs" },
					{ src: "app/css/gradient3.svg", dest: "out/assets" },
				],
			}),
		],
	},
];
