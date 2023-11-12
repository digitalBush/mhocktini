module.exports = {
	plugins: ["@stylistic/js"],
	env: {
		node: true,
		es2024: true
	},
	extends: ["eslint:recommended", "prettier"],
	parserOptions: {
		ecmaVersion: "latest",
		sourceType: "module"
	},
	rules: {
		"no-unused-vars": ["error", {argsIgnorePattern: "^_"}]
	}
};
