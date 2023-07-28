import { src, task, dest, parallel } from "gulp";
import gulpEsbuild from "gulp-esbuild";
import cssnano from "cssnano";
import postcss from "gulp-postcss";
import gulpSass from "gulp-sass";
import dartSass from "sass";

const production = process.env.NODE_ENV === "production";
const sass = gulpSass(dartSass);

const plugins = [];
if (production) {
	plugins.push(
		cssnano({
			preset: [
				"advanced",
				{
					discardComments: {
						removeAll: true,
					},
					discardEmpty: true,
					normalizeUrl: true,
					autoprefixer: true,
				},
			],
		}),
	);
}

task("copy-assets", () => {
	return src("app/assets/*").pipe(dest("out/assets"));
});

task("gulp-copy-html", () => {
	return src("app/*html").pipe(dest("out"));
});

task("gulp-copy-libs", () => {
	return src("app/libs/**/**").pipe(dest("out/libs"));
});

task("bundle-css", () => {
	const plugins = [
		cssnano({
			preset: [
				"advanced",
				{
					discardComments: {
						removeAll: true,
					},
					discardEmpty: true,
					normalizeUrl: true,
					autoprefixer: true,
				},
			],
		}),
	];

	src("app/css/settings.scss")
		.pipe(sass())
		.pipe(postcss(plugins))
		.pipe(dest("out/css"));

	return src("app/css/index.scss")
		.pipe(sass())
		.pipe(postcss(plugins))
		.pipe(dest("out/css"));
});

task("build-render", () => {
	return src("app/render/*.ts")
		.pipe(
			gulpEsbuild({
				// outfile: "render.mjs",
				outdir: "./",
				bundle: true,
				treeShaking: true,
				format: "esm",
				minify: production,
			}),
		)
		.pipe(dest("out/render"));
});

task("build-helpers", () => {
	return src("app/helpers/*.ts")
		.pipe(
			gulpEsbuild({
				bundle: false,
				treeShaking: true,
				minify: production,
				format: "cjs",
				platform: "node",
				packages: "external",
			}),
		)
		.pipe(dest("out/helpers"));
});

task("build-preload", () => {
	return src("app/preload/*.ts")
		.pipe(
			gulpEsbuild({
				outfile: "preload.js",
				bundle: false,
				treeShaking: true,
				minify: production,
				format: "cjs",
				platform: "node",
				packages: "external",
			}),
		)
		.pipe(dest("out/preload"));
});

task("build-main", () => {
	return src("app/main/*.ts")
		.pipe(
			gulpEsbuild({
				bundle: false,
				treeShaking: true,
				minify: production,
				format: "cjs",
				platform: "node",
				packages: "external",
			}),
		)
		.pipe(dest("out/main"));
});

task(
	"default",
	parallel(
		parallel("build-main", "build-preload", "build-render", "build-helpers"),
		parallel("bundle-css", "copy-assets", "gulp-copy-html", "gulp-copy-libs"),
	),
);
