/*jshint node:true*/
'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

var _events = require('events');

var _child_process = require('child_process');

var _utils = require('./utils');

var _ffmpegInput = require('./ffmpegInput');

var _ffmpegInput2 = _interopRequireDefault(_ffmpegInput);

var _ffmpegOutput = require('./ffmpegOutput');

var _ffmpegOutput2 = _interopRequireDefault(_ffmpegOutput);

var ffmpegBinaryPath = 'ffmpeg';
var nlRegexp = /\r\n|\r|\n/g;

/**
 * A FFmpeg helper class
 *
 * This provides a nicer interface for building & running ffmpeg commands.
 * As a general run each function called runs on the last input / ouput addec
 *
 * @returns {FfmpegCommand}
 * @constructor
 */

var FfmpegCommand = (function (_EventEmitter) {
	/**
  *
  */

	function FfmpegCommand() {
		_classCallCheck(this, FfmpegCommand);

		_get(Object.getPrototypeOf(FfmpegCommand.prototype), 'constructor', this).call(this);

		this._inputs = [];
		this._outputs = [];

		this._options = {};
	}

	_inherits(FfmpegCommand, _EventEmitter);

	_createClass(FfmpegCommand, [{
		key: 'input',
		value: function input(file, options) {
			var ret = new _ffmpegInput2['default'](this, file, options);
			this._inputs.push(ret);
			return ret;
		}
	}, {
		key: 'output',
		value: function output(file, options) {
			var ret = new _ffmpegOutput2['default'](this, file, options);
			this._outputs.push(ret);
			return ret;
		}
	}, {
		key: 'strictMode',
		value: function strictMode(_strictMode) {
			if (_strictMode) {
				this._options['-strict'] = ['-strict', '-2'];
			} else {
				delete this._options['-strict'];
			}

			return this;
		}
	}, {
		key: 'overwrite',
		value: function overwrite(value) {
			if (value) {
				this._options['-y'] = ['-y'];
			} else {
				delete this._options['-y'];
			}

			return this;
		}
	}, {
		key: 'complexFilter',
		value: function complexFilter(_complexFilter) {
			if (Array.isArray(_complexFilter)) {
				_complexFilter = _complexFilter.join(';');
			}

			(0, _utils.setOrClear)(this._options, '-filter_complex', _complexFilter);

			return this;
		}
	}, {
		key: 'run',
		value: function run() {
			var _this = this;

			var self = this;

			var stdout = '';
			var stdoutClosed = false;

			var stderr = '';
			var stderrClosed = false;

			var processExited = false;

			// Ensure we send 'end' or 'error' only once
			var ended = false;

			function emitEnd(err) {
				if (ended) {
					return;
				}

				if (err) {
					ended = true;

					if (err.message.match(/ffmpeg exited with code/)) {
						// Add ffmpeg error message
						err.message += ': ' + FfmpegCommand.extractError(stderr);
					}

					self.emit('error', err);
				} else if (processExited && stdoutClosed && stderrClosed) {
					ended = true;

					self.emit('end');
				}
			}

			var args = this.args;
			stdout += FfmpegCommand.ffmpegBinary() + ' ' + args.join(' ') + '\n';
			this.ffmpegProc = (0, _child_process.spawn)(FfmpegCommand.ffmpegBinary(), args);
			this.emit('start', FfmpegCommand.ffmpegBinary() + ' ' + args.join(' '));

			if (this.ffmpegProc.stderr) {
				this.ffmpegProc.stderr.setEncoding('utf8');
			}

			this.ffmpegProc.on('error', emitEnd);

			// Handle process exit
			this.ffmpegProc.on('exit', function (code, signal) {
				processExited = true;

				if (signal) {
					emitEnd(new Error('ffmpeg was killed with signal ' + signal));
				} else if (code) {
					emitEnd(new Error('ffmpeg exited with code ' + code));
				} else {
					emitEnd();
				}
			});

			this.ffmpegProc.stdout.on('data', function (data) {
				stdout += data;
			});

			this.ffmpegProc.stdout.on('close', function () {
				stdoutClosed = true;
				emitEnd();
			});

			this.ffmpegProc.stderr.on('data', function (data) {
				stderr += data;

				var progress = FfmpegCommand.extractProgress(data);
				if (progress) {
					_this.emit('progress', progress);
				}
			});

			this.ffmpegProc.stderr.on('close', function () {
				stderrClosed = true;
				emitEnd();
			});

			return this;
		}
	}, {
		key: 'kill',
		value: function kill(signal) {
			if (this.ffmpegProc) {
				this.ffmpegProc.kill(signal || 'SIGKILL');
			}

			return this;
		}
	}, {
		key: 'args',
		get: function () {
			var _this2 = this;

			return [].concat(this._inputs.reduce(function (args, input) {
				return args.concat(input.inputArgs);
			}, []), Object.keys(this._options).reduce(function (args, current) {
				return args.concat(_this2._options[current]);
			}, []), this._outputs.reduce(function (args, output) {
				return args.concat(output.outputArgs);
			}, []));
		}
	}], [{
		key: 'ffmpegBinary',
		value: function ffmpegBinary(path) {
			if (path) {
				ffmpegBinaryPath = path;
			}

			return ffmpegBinaryPath;
		}
	}, {
		key: 'extractError',

		/**
   * Extract error message(s) from ffmpeg stderr
   *
   * @param {String} stderr ffmpeg stderr data
   * @return {String}
   * @private
   */
		value: function extractError(stderr) {
			// Only return the last stderr lines that don't start with a space or a square bracket
			return stderr.split(nlRegexp).reduce(function (messages, message) {
				if (message.charAt(0) === ' ' || message.charAt(0) === '[') {
					return [];
				} else {
					messages.push(message);
					return messages;
				}
			}, []).join('\n');
		}
	}, {
		key: 'extractProgress',

		/**
   * Extract progress data from ffmpeg stderr and emit 'progress' event if appropriate
   *
   * @param {String} stderr ffmpeg stderr data
   * @private
   */
		value: function extractProgress(stderr) {
			var lines = stderr.split(nlRegexp);
			var lastLine = lines[lines.length - 2];
			var progress = {};

			if (!lastLine) {
				return null;
			}

			// Remove all spaces after = and trim
			lastLine = lastLine.replace(/=\s+/g, '=').trim();
			var progressParts = lastLine.split(' ');

			// Split every progress part by "=" to get key and value
			for (var i = 0; i < progressParts.length; i++) {
				var progressSplit = progressParts[i].split('=', 2);

				// This is not a progress line
				if (typeof progressSplit[1] === 'undefined') {
					return null;
				}

				progress[progressSplit[0]] = progressSplit[1];
			}

			// build progress report object
			return {
				frames: parseInt(progress.frame, 10),
				currentFps: parseInt(progress.fps, 10),
				currentKbps: parseFloat(progress.bitrate.replace('kbits/s', '')),
				targetSize: parseInt(progress.size, 10),
				timemark: progress.time
			};
		}
	}]);

	return FfmpegCommand;
})(_events.EventEmitter);

exports['default'] = FfmpegCommand;
module.exports = exports['default'];