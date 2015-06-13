'use strict';

export function setOrClear(options, key, value) {
	if (value) {
		options[key] = [key].concat(value);
	} else {
		delete options[key];
	}
}
