/*eslint-env mocha*/

'use strict';

import { assert } from 'chai';
import Ffmpeg from '../src/ffmpeg';
import FfmpegInput from '../src/ffmpegInput';

describe('FfmpegInput', function () {
	let inputClass = new Ffmpeg().input('file.mp4');

	it('should return FfmpegInput class on Ffmpeg.input()', function () {
		assert.instanceOf(inputClass, FfmpegInput);
	});

	it('should return index 0', function () {
		assert.equal(inputClass.index, 0);
	});

	it('should have input as only args', function () {
		assert.deepEqual(inputClass.inputArgs, ['-i', 'file.mp4']);
	});
});
