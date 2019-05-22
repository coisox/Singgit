module.exports = {
	"globDirectory": ".",
	"globPatterns": [
		"**/*.{json,svg,png,ttf,woff,css,html,js}"
	],
	"globIgnores": [
		'~db/**/*',
		'~resources/**/*',
		'~v1/**/*',
	],
	"swDest": "sw.js",
	"swSrc": "sw-config.js"
};
