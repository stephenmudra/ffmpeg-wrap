/*eslint-env mocha*/

'use strict';

import { assert } from 'chai';
import Ffmpeg from '../src/ffmpeg';
import FfmpegOutput from '../src/ffmpegOutput';

describe('FFMpegOutput', function () {
	let inputClass = new Ffmpeg().output('file.mp4');

	it('should return FfmpegOutput class on Ffmpeg.output()', function () {
		assert.instanceOf(inputClass, FfmpegOutput);
	});

	it('should have output as only args', function () {
		assert.deepEqual(inputClass.outputArgs, ['file.mp4']);
	});
});
