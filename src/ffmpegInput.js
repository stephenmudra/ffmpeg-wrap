'use strict';

import FfmpegBase from './ffmpegBase';

/**
 * A Ffmpeg Input class
 *
 *
 * @returns {FfmpegInput}
 * @extends FfmpegBase
 * @constructor
 */
class FfmpegInput extends FfmpegBase {
	get index() {
		return this._ffmpeg._inputs.indexOf(this);
	}

	get inputArgs() {
		return [].concat(
			Object.keys(this._options).reduce((args, current) => args.concat(this._options[current]), []),
			['-i', this._file]
		);
	}
}

export default FfmpegInput;
