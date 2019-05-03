module.exports = {
  "globDirectory": ".",
  "globPatterns": [
    "**/*.{json,svg,png,ttf,woff,css,html,js}"
  ],
  "globIgnores": [
	'~resources/**/*',
	'~bak/**/*'
  ],
  "swDest": "sw.js",
  "swSrc": "sw-config.js"
};