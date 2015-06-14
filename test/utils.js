/*eslint-env mocha*/

'use strict';

import { assert } from 'chai';

import { setOrClear } from '../src/utils';

describe('Utils', function () {
	describe('setOrClear', function () {
		it('should have input as only args', function () {
			let options = {};
			setOrClear(options, 'key', 'value');
			assert.deepEqual(options, { 'key': ['key', 'value']});
		});
		it('should only have one key for multiple inputs', function () {
			let options = {};
			setOrClear(options, 'key', 'value');
			assert.deepEqual(options, { 'key': ['key', 'value']});
			setOrClear(options, 'key', 'value2');
			assert.deepEqual(options, { 'key': ['key', 'value2']});
			setOrClear(options, 'key', 'value');
			assert.deepEqual(options, { 'key': ['key', 'value']});
		});
	});
});
