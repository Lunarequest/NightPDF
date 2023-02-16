module.exports = {
	root: true,
	plugins: ["prettier"],
	extends: [
		"eslint:recommended",
		"prettier",
		"plugin:@typescript-eslint/recommended",
	],
	parser: "@typescript-eslint/parser",
	rules: {
		"prettier/prettier": 2, // Means error
	},
	parserOptions: {
		ecmaVersion: 12,
	},
	env: {
		es6: true,
		node: true,
		browser: true,
		iife: true,
	},
	globals: {
		require: true,
		process: true,
	},
	root: true,
};
