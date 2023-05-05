import { src, task, dest, parallel } from "gulp";
import gulpEsbuild from "gulp-esbuild";
import cssnano from "cssnano";
import concat from "gulp-concat";
import postcss from "gulp-postcss";

const production = process.env.NODE_ENV === "production";

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
	return src(["app/css/*.css", "node_modules/nouislider/dist/*.css"])
		.pipe(concat("bundle.css"))
		.pipe(postcss(plugins))
		.pipe(dest("out/css"));
});

task("build-render", () => {
	return src("app/render/*.ts")
		.pipe(
			gulpEsbuild({
				outfile: "render.mjs",
				bundle: true,
				minify: production,
			}),
		)
		.pipe(dest("out/render"));
});

task("build-preload", () => {
	return src("app/preload/*.ts")
		.pipe(
			gulpEsbuild({
				outfile: "preload.js",
				bundle: false,
				minify: production,
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
				minify: production,
				platform: "node",
				packages: "external",
			}),
		)
		.pipe(dest("out/main"));
});

task(
	"default",
	parallel(
		"build-main",
		"build-preload",
		"build-render",
		"bundle-css",
		"copy-assets",
		"gulp-copy-html",
		"gulp-copy-libs",
	),
);
