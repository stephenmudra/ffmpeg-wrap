'use strict';

import FfmpegBase from './ffmpegBase';

class FfmpegOutput extends FfmpegBase {
	get outputArgs() {
		return [].concat(
			Object.keys(this._options).reduce((args, current) => args.concat(this._options[current]), []),
			[this._file]
		);
	}

	videoCodec(videoCodec) {
		if (!videoCodec) {
			this._options['-c:v'] = ['-vn'];
		} else {
			this._options['-c:v'] = ['-c:v', videoCodec];
		}

		return this;
	}

	audioCodec(audioCodec) {
		if (!audioCodec) {
			this._options['-c:a'] = ['-an'];
		} else {
			this._options['-c:a'] = ['-c:v', audioCodec];
		}

		return this;
	}
}

export default FfmpegOutput;
