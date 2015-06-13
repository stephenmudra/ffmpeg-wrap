'use strict';

import { setOrClear } from './utils';

class FfmpegBase {
	constructor(ffmpeg, file, options = {}) {
		this._ffmpeg = ffmpeg;
		this._file = file;

		this._options = [];

		Object.keys(options).forEach(key => {
			if (this[key].apply) {
				this[key].apply(this, [].concat(options[key]));
			}
		});
	}

	/**
	 * Set frame size.
	 * As an input option, this is a shortcut for the video_size private option, recognized
	 * by some demuxers for which the frame size is either not stored in the file or is
	 * configurable – e.g. raw video or video grabbers.
	 * As an output option, this inserts the scale video filter to the end of the corresponding
	 * filtergraph. Please use the scale filter directly to insert it at the beginning or some
	 * other place.
	 * The format is ‘wxh’ (default - same as source).
	 *
	 * FFMPEG Command: -s[:stream_specifier] size (input/output,per-stream)
	 *
	 * @param width
	 * @param height
	 * @returns {FfmpegBase}
	 */
	size(width, height) {
		setOrClear(this._options, '-s', (width | 0) + 'x' + (height | 0));
		return this;
	}

	fps(value) {
		setOrClear(this._options, '-r', value);
		return this;
	}

	quantization(value) {
		setOrClear(this._options, '-qp', value);
		return this;
	}

	/**
	 * When used as an input option (before -i), limit the duration of data read from the
	 * input file.
	 * When used as an output option (before an output filename), stop writing the output
	 * after its duration reaches duration.
	 * Duration may be a number in seconds, or in hh:mm:ss[.xxx] form.
	 *
	 * FFMPEG Command: -t duration (input/output)
	 *
	 * @param value
	 * @returns {FfmpegBase}
	 */
	duration(value) {
		setOrClear(this._options, '-t', value);
		return this;
	}

	/**
	 * Force input or output file format. The format is normally auto detected for input files
	 * and guessed from the file extension for output files, so this option is not needed in
	 * most cases.
	 *
	 * FFMPEG Command: -f fmt (input/output)
	 *
	 * @param value
	 * @returns {FfmpegBase}
	 */
	format(value) {
		setOrClear(this._options, '-f', value);
		return this;
	}

	map(value) {
		setOrClear(this._options, '-map', value);
		return this;
	}

	/**
	 * When used as an input option (before -i), seeks in this input file to position. Note
	 * the in most formats it is not possible to seek exactly, so ffmpeg will seek to the
	 * closest seek point before position. When transcoding this extra segment between the
	 * seek point and position will be decoded and discarded. When doing stream copy it will
	 * be preserved.
	 * When used as an output option (before an output filename), decodes but discards input
	 * until the timestamps reach position.
	 * Position may be either in seconds or in hh:mm:ss[.xxx] form.
	 *
	 * FFMPEG Command: -ss position (input/output)
	 *
	 * @param value
	 * @returns {FfmpegBase}
	 */
	seek(value) {
		setOrClear(this._options, '-ss', value);
		return this;
	}

	frames(value) {
		setOrClear(this._options, '-vframes', value);
		return this;
	}

	preset(value) {
		setOrClear(this._options, '-preset', value);
		return this;
	}

	/**
	 * Set pixel format. Use -pix_fmts to show all the supported pixel formats. If the
	 * selected pixel format can not be selected, ffmpeg will print a warning and select the
	 * best pixel format supported by the encoder. If pix_fmt is prefixed by a +, ffmpeg will
	 * exit with an error if the requested pixel format can not be selected, and automatic
	 * conversions inside filtergraphs are disabled. If pix_fmt is a single +, ffmpeg selects
	 * the same pixel format as the input (or graph output) and automatic conversions are
	 * disabled.
	 *
	 * FFMPEG Command: -pix_fmt[:stream_specifier] format (input/output,per-stream)
	 *
	 * @param value
	 * @returns {FfmpegBase}
	 */
	pixelFormat(value) {
		setOrClear(this._options, '-pix_fmt', value);
		return this;
	}

	constantRateFactor(value) {
		setOrClear(this._options, '-crf', value);
		return this;
	}

	audioChannels(value) {
		setOrClear(this._options, '-ac', value);
		return this;
	}

	audioFrequency(value) {
		setOrClear(this._options, '-ar', value);
		return this;
	}

	audioBitrate(value) {
		setOrClear(this._options, '-ab', value);
		return this;
	}

	input() {
		return this._ffmpeg.input(...arguments);
	}

	output() {
		return this._ffmpeg.output(...arguments);
	}

	run() {
		return this._ffmpeg.run(...arguments);
	}

	kill() {
		return this._ffmpeg.kill(...arguments);
	}

	on() {
		return this._ffmpeg.on(...arguments);
	}

	off() {
		return this._ffmpeg.off(...arguments);
	}

	emit() {
		return this._ffmpeg.emit(...arguments);
	}
}

export default FfmpegBase;
