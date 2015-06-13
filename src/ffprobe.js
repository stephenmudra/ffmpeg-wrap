/*jshint node:true*/
'use strict';

var EventEmitter = require('events').EventEmitter;
var util = require('util');
var path = require('path');
var spawn = require('child_process').spawn;
var exec = require('child_process').exec;

/**
 * A FFmpeg helper class
 *
 * This provides a nicer interface for building & running ffmpeg commands.
 * As a general run each function called runs on the last input / ouput addec
 *
 * @returns {FfmpegCommand}
 * @constructor
 */
function FfprobeCommand() {
	// Make 'new' optional
	if (!(this instanceof FfprobeCommand)) {
		return new FfprobeCommand();
	}

	EventEmitter.call(this);
}

util.inherits(FfprobeCommand, EventEmitter);

FfprobeCommand.prototype.ffprobeBinaryPath = 'ffprobe';

FfprobeCommand.prototype.ffprobeBinary = FfprobeCommand.ffprobeBinary = function (path) {
	if (path) {
		FfprobeCommand.prototype.ffprobeBinaryPath = path;
	}

	return FfprobeCommand.prototype.ffprobeBinaryPath;
};

function findBlocks(raw) {
	var stream_start = raw.indexOf('[STREAM]') + 8,
		stream_end = raw.lastIndexOf('[/STREAM]'),
		format_start = raw.indexOf('[FORMAT]') + 8,
		format_end = raw.lastIndexOf('[/FORMAT]');

	var blocks = {streams: null, format: null};

	if (stream_start !== 7 && stream_end !== -1) {
		blocks.streams = raw.slice(stream_start, stream_end).trim();
	}

	if (format_start !== 7 && format_end !== -1) {
		blocks.format = raw.slice(format_start, format_end).trim();
	}

	return blocks;
};


function parseField(str) {
	str = ("" + str).trim();
	return str.match(/^\d+\.?\d*$/) ? parseFloat(str) : str;
};

function parseBlock(block) {
	var block_object = {}, lines = block.split('\n');

	lines.forEach(function (line) {
		var data = line.split('=');
		if (data && data.length === 2) {
			block_object[data[0]] = parseField(data[1]);
		}
	});

	return block_object;
};

function parseStreams(text, callback) {
	if (!text) return {streams: null};

	var streams = [];
	var blocks = text.replace('[STREAM]\n', '').split('[/STREAM]');

	blocks.forEach(function (stream, idx) {
		var codec_data = parseBlock(stream);
		var sindex = codec_data.index;
		delete codec_data.index;

		if (sindex) streams[sindex] = codec_data;
		else streams.push(codec_data);
	});

	return {streams: streams};
};

function parseFormat(text, callback) {
	if (!text) return {format: null}

	var block = text.replace('[FORMAT]\n', '').replace('[/FORMAT]', '');

	var raw_format = parseBlock(block),
		format = {},
		metadata = {};

	//REMOVE metadata
	delete raw_format.filename;
	for (var attr in raw_format) {
		if (raw_format.hasOwnProperty(attr)) {
			if (attr.indexOf('TAG') === -1) format[attr] = raw_format[attr];
			else metadata[attr.slice(4)] = raw_format[attr];
		}
	}

	return {format: format, metadata: metadata};
};

FfprobeCommand.prototype.run = function (file, callback) {
	var self = this;

	var stdout = '';
	var stdoutClosed = false;

	var stderr = '';
	var stderrClosed = false;

	var processExited = false;

	// Ensure we send 'end' or 'error' only once
	var ended = false;

	function emitEnd(err) {
		if (!ended) {
			if (err) {
				ended = true;

				callback(err, stdout, stderr);
				//self.emit('error', err);
			} else if (processExited && stdoutClosed && stderrClosed) {
				ended = true;

				var blocks = findBlocks(stdout);

				var s = parseStreams(blocks.streams),
					f = parseFormat(blocks.format);

				callback(null, {
					filename: path.basename(file),
					filepath: path.dirname(file),
					fileext: path.extname(file),
					file: file,
					streams: s.streams,
					format: f.format,
					metadata: f.metadata
				});
				//self.emit('end');
			}
		}
	}

	var args = ['-show_streams', '-show_format', '-loglevel', 'warning', file];

	stdout += this.ffprobeBinary() + ' ' + args.join(' ') + "\n";
	this.ffmpegProc = spawn(this.ffprobeBinary(), args);
	self.emit('start', this.ffprobeBinary() + ' ' + args.join(' '));

	if (this.ffmpegProc.stderr) {
		this.ffmpegProc.stderr.setEncoding('utf8');
	}

	if (this.ffmpegProc.stdout) {
		this.ffmpegProc.stdout.setEncoding('utf8');
	}

	this.ffmpegProc.on('error', function (err) {
		emitEnd(err);
	});

	// Handle process exit
	this.ffmpegProc.on('exit', function (code, signal) {
		processExited = true;

		if (signal) {
			emitEnd(new Error('ffprobe was killed with signal ' + signal));
		} else if (code) {
			emitEnd(new Error('ffprobe exited with code ' + code));
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
	});

	this.ffmpegProc.stderr.on('close', function () {
		stderrClosed = true;
		emitEnd();
	});

	return this;
};

module.exports = FfprobeCommand;
