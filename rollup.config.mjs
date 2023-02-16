import { rollupPluginHTML as html } from "@web/rollup-plugin-html";
import { swc, defineRollupSwcOption } from "rollup-plugin-swc3";
import copy from "rollup-plugin-copy";

export default [
	{
		input: ["app/main/menutemplate.ts", "app/main/app.ts"],
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
					tsconfig: "./tsconfig.preload.json",
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
		},
		external: ["nouislider"],
		plugins: [
			swc(
				defineRollupSwcOption({
					tsconfig: "./tsconfig.app.json",
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
