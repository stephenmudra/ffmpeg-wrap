'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});
exports.setOrClear = setOrClear;

function setOrClear(options, key, value) {
	if (value) {
		options[key] = [key].concat(value);
	} else {
		delete options[key];
	}
}