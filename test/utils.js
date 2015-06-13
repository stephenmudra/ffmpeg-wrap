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
	});
});
