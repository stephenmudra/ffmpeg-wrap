'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _utils = require('./utils');

var FfmpegBase = (function () {
	function FfmpegBase(ffmpeg, file) {
		var _this = this;

		var options = arguments[2] === undefined ? {} : arguments[2];

		_classCallCheck(this, FfmpegBase);

		this._ffmpeg = ffmpeg;
		this._file = file;

		this._options = [];

		Object.keys(options).forEach(function (key) {
			if (_this[key].apply) {
				_this[key].apply(_this, [].concat(options[key]));
			}
		});
	}

	_createClass(FfmpegBase, [{
		key: 'size',

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
		value: function size(width, height) {
			(0, _utils.setOrClear)(this._options, '-s', (width | 0) + 'x' + (height | 0));
			return this;
		}
	}, {
		key: 'fps',
		value: function fps(value) {
			(0, _utils.setOrClear)(this._options, '-r', value);
			return this;
		}
	}, {
		key: 'quantization',
		value: function quantization(value) {
			(0, _utils.setOrClear)(this._options, '-qp', value);
			return this;
		}
	}, {
		key: 'duration',

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
		value: function duration(value) {
			(0, _utils.setOrClear)(this._options, '-t', value);
			return this;
		}
	}, {
		key: 'format',

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
		value: function format(value) {
			(0, _utils.setOrClear)(this._options, '-f', value);
			return this;
		}
	}, {
		key: 'map',
		value: function map(value) {
			(0, _utils.setOrClear)(this._options, '-map', value);
			return this;
		}
	}, {
		key: 'seek',

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
		value: function seek(value) {
			(0, _utils.setOrClear)(this._options, '-ss', value);
			return this;
		}
	}, {
		key: 'frames',
		value: function frames(value) {
			(0, _utils.setOrClear)(this._options, '-vframes', value);
			return this;
		}
	}, {
		key: 'preset',
		value: function preset(value) {
			(0, _utils.setOrClear)(this._options, '-preset', value);
			return this;
		}
	}, {
		key: 'pixelFormat',

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
		value: function pixelFormat(value) {
			(0, _utils.setOrClear)(this._options, '-pix_fmt', value);
			return this;
		}
	}, {
		key: 'constantRateFactor',
		value: function constantRateFactor(value) {
			(0, _utils.setOrClear)(this._options, '-crf', value);
			return this;
		}
	}, {
		key: 'audioChannels',
		value: function audioChannels(value) {
			(0, _utils.setOrClear)(this._options, '-ac', value);
			return this;
		}
	}, {
		key: 'audioFrequency',
		value: function audioFrequency(value) {
			(0, _utils.setOrClear)(this._options, '-ar', value);
			return this;
		}
	}, {
		key: 'audioBitrate',
		value: function audioBitrate(value) {
			(0, _utils.setOrClear)(this._options, '-ab', value);
			return this;
		}
	}, {
		key: 'input',
		value: function input() {
			var _ffmpeg;

			return (_ffmpeg = this._ffmpeg).input.apply(_ffmpeg, arguments);
		}
	}, {
		key: 'output',
		value: function output() {
			var _ffmpeg2;

			return (_ffmpeg2 = this._ffmpeg).output.apply(_ffmpeg2, arguments);
		}
	}, {
		key: 'run',
		value: function run() {
			var _ffmpeg3;

			return (_ffmpeg3 = this._ffmpeg).run.apply(_ffmpeg3, arguments);
		}
	}, {
		key: 'kill',
		value: function kill() {
			var _ffmpeg4;

			return (_ffmpeg4 = this._ffmpeg).kill.apply(_ffmpeg4, arguments);
		}
	}, {
		key: 'on',
		value: function on() {
			var _ffmpeg5;

			return (_ffmpeg5 = this._ffmpeg).on.apply(_ffmpeg5, arguments);
		}
	}, {
		key: 'off',
		value: function off() {
			var _ffmpeg6;

			return (_ffmpeg6 = this._ffmpeg).off.apply(_ffmpeg6, arguments);
		}
	}, {
		key: 'emit',
		value: function emit() {
			var _ffmpeg7;

			return (_ffmpeg7 = this._ffmpeg).emit.apply(_ffmpeg7, arguments);
		}
	}]);

	return FfmpegBase;
})();

exports['default'] = FfmpegBase;
module.exports = exports['default'];