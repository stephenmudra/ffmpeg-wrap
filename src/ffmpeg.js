/*jshint node:true*/
'use strict';

import { EventEmitter } from 'events';
import { spawn } from 'child_process';

import { setOrClear } from './utils';
import FfmpegInput from './ffmpegInput';
import FfmpegOutput from './ffmpegOutput';

let ffmpegBinaryPath = 'ffmpeg';
const nlRegexp = /\r\n|\r|\n/g;

/**
 * A FFmpeg helper class
 *
 * This provides a nicer interface for building & running ffmpeg commands.
 * As a general run each function called runs on the last input / ouput addec
 *
 * @returns {FfmpegCommand}
 * @constructor
 */
class FfmpegCommand extends EventEmitter {
	/**
	 *
	 */
	constructor() {
		super();

		this._inputs = [];
		this._outputs = [];

		this._options = {};
	}

	static ffmpegBinary(path) {
		if (path) {
			ffmpegBinaryPath = path;
		}

		return ffmpegBinaryPath;
	}

	input(file, options) {
		let ret = new FfmpegInput(this, file, options);
		this._inputs.push(ret);
		return ret;
	}

	output(file, options) {
		let ret = new FfmpegOutput(this, file, options);
		this._outputs.push(ret);
		return ret;
	}

	strictMode(strictMode) {
		if (strictMode) {
			this._options['-strict'] = ['-strict', '-2'];
		} else {
			delete this._options['-strict'];
		}

		return this;
	}

	overwrite(value) {
		if (value) {
			this._options['-y'] = ['-y'];
		} else {
			delete this._options['-y'];
		}

		return this;
	}

	complexFilter(complexFilter) {
		if (Array.isArray(complexFilter)) {
			complexFilter = complexFilter.join(';');
		}

		setOrClear(this._options, '-filter_complex', complexFilter);

		return this;
	}

	get args() {
		return [].concat(
			this._inputs.reduce((args, input) => args.concat(input.inputArgs), []),

			Object.keys(this._options).reduce((args, current) => args.concat(this._options[current]), []),

			this._outputs.reduce((args, output) => args.concat(output.outputArgs), [])
		);
	}

	run() {
		let self = this;

		let stdout = '';
		let stdoutClosed = false;

		let stderr = '';
		let stderrClosed = false;

		let processExited = false;

		// Ensure we send 'end' or 'error' only once
		let ended = false;

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

		let args = this.args;
		stdout += FfmpegCommand.ffmpegBinary() + ' ' + args.join(' ') + '\n';
		this.ffmpegProc = spawn(FfmpegCommand.ffmpegBinary(), args);
		this.emit('start', FfmpegCommand.ffmpegBinary() + ' ' + args.join(' '));

		if (this.ffmpegProc.stderr) {
			this.ffmpegProc.stderr.setEncoding('utf8');
		}

		this.ffmpegProc.on('error', emitEnd);

		// Handle process exit
		this.ffmpegProc.on('exit', (code, signal) => {
			processExited = true;

			if (signal) {
				emitEnd(new Error('ffmpeg was killed with signal ' + signal));
			} else if (code) {
				emitEnd(new Error('ffmpeg exited with code ' + code));
			} else {
				emitEnd();
			}
		});

		this.ffmpegProc.stdout.on('data', (data) => {
			stdout += data;
		});

		this.ffmpegProc.stdout.on('close', () => {
			stdoutClosed = true;
			emitEnd();
		});

		this.ffmpegProc.stderr.on('data', (data) => {
			stderr += data;

			let progress = FfmpegCommand.extractProgress(data);
			if (progress) {
				this.emit('progress', progress);
			}
		});

		this.ffmpegProc.stderr.on('close', () => {
			stderrClosed = true;
			emitEnd();
		});

		return this;
	}

	kill(signal) {
		if (this.ffmpegProc) {
			this.ffmpegProc.kill(signal || 'SIGKILL');
		}

		return this;
	}

	/**
	 * Extract error message(s) from ffmpeg stderr
	 *
	 * @param {String} stderr ffmpeg stderr data
	 * @return {String}
	 * @private
	 */
	static extractError(stderr) {
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

	/**
	 * Extract progress data from ffmpeg stderr and emit 'progress' event if appropriate
	 *
	 * @param {String} stderr ffmpeg stderr data
	 * @private
	 */
	static extractProgress(stderr) {
		let lines = stderr.split(nlRegexp);
		let lastLine = lines[lines.length - 2];
		let progress = {};

		if (!lastLine) {
			return null;
		}

		// Remove all spaces after = and trim
		lastLine = lastLine.replace(/=\s+/g, '=').trim();
		let progressParts = lastLine.split(' ');

		// Split every progress part by "=" to get key and value
		for (var i = 0; i < progressParts.length; i++) {
			let progressSplit = progressParts[i].split('=', 2);

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
}

export default FfmpegCommand;
