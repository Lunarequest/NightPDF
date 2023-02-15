import commonjs from "@rollup/plugin-commonjs";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import typescript from "@rollup/plugin-typescript";
import { uglify } from "rollup-plugin-uglify";

export default [
	{
		input: ["app/main/menutemplate.ts", "app/main/app.ts"],
		output: [
			{
				dir: "./out/main/",
				format: "cjs",
			},
		],
		plugins: [
			nodeResolve(),
			typescript(),
			commonjs({
				include: "./node_modules/**",
			}),
			uglify(),
		],
	},
	{
		input: "app/preload/preload.ts",
		output: [
			{
				file: "./out/preload/preload.js",
				format: "cjs",
			},
		],
		plugins: [
			nodeResolve(),
			typescript({
				tsconfig: "./tsconfig.preload.json",
			}),
			uglify(),
		],
	},
	{
		input: "./app/render/index.ts",
		output: {
			file: "./out/index/index.js",
			format: "iife",
		},
		external: ["nouislider"],
		plugins: [
			typescript({
				tsconfig: "./tsconfig.app.json",
				target: "ES6",
			}),
			uglify(),
		],
	},
];
