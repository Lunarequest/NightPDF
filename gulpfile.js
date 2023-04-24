const gulp = require("gulp");
const gulpEsbuild = require("gulp-esbuild");
const process = require("process");
const cssnano = require("cssnano");
const autoprefixer = require("autoprefixer");
const concat = require("gulp-concat");
const postcss = require("gulp-postcss");

const production = process.env.NODE_ENV === "production";

gulp.task("copy-assets", () => {
	return gulp.src("app/assets/*").pipe(gulp.dest("out/assets"));
});

gulp.task("gulp-copy-html", () => {
	return gulp.src("app/*html").pipe(gulp.dest("out"));
});

gulp.task("gulp-copy-libs", () => {
	return gulp.src("app/libs/**/**").pipe(gulp.dest("out/libs"));
});

gulp.task("bundle-css", () => {
	const plugins = [autoprefixer(), cssnano()];
	return gulp
		.src(["app/css/*.css", "node_modules/nouislider/dist/*.css"])
		.pipe(concat("bundle.css"))
		.pipe(postcss(plugins))
		.pipe(gulp.dest("out/css"));
});

gulp.task("build-render", () => {
	return gulp
		.src("app/render/*.ts")
		.pipe(
			gulpEsbuild({
				outfile: "render.mjs",
				bundle: true,
				minify: production,
			}),
		)
		.pipe(gulp.dest("out/render"));
});

gulp.task("build-preload", () => {
	return gulp
		.src("app/preload/*.ts")
		.pipe(
			gulpEsbuild({
				outfile: "preload.js",
				bundle: false,
				minify: production,
				platform: "node",
				packages: "external",
			}),
		)
		.pipe(gulp.dest("out/preload"));
});

gulp.task("build-main", () => {
	return gulp
		.src("app/main/*.ts")
		.pipe(
			gulpEsbuild({
				bundle: false,
				minify: production,
				platform: "node",
				packages: "external",
			}),
		)
		.pipe(gulp.dest("out/main"));
});

gulp.task(
	"default",
	gulp.parallel(
		"build-main",
		"build-preload",
		"build-render",
		"bundle-css",
		"copy-assets",
		"gulp-copy-html",
		"gulp-copy-libs",
	),
);
