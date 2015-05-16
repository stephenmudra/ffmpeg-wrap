/*jshint node:true*/
'use strict';

var EventEmitter = require('events').EventEmitter;
var _ = require('lodash');
var spawn = require('child_process').spawn;


function FfmpegCommand() {
    // Make 'new' optional
    if (!(this instanceof FfmpegCommand)) {
        return new FfmpegCommand();
    }

    EventEmitter.call(this);

    this._inputs = [];
    this._outputs = [];

    this._options = {};
    this._current = null;

    this.index = null;
}

FfmpegCommand.prototype.ffmpegBinary = FfmpegCommand.ffmpegBinary = function (path) {
    if (path) {
        FfmpegCommand.prototype.ffmpegBinaryPath = path;
    }

    return FfmpegCommand.prototype.ffmpegBinaryPath;
};

var commandArgs = {
    'fps': '-r',
    'quantization': '-qp',
    'duration': '-t',
    'seek': '-ss',
    'format': '-f',
    'map': '-map',
    'frames': '-vframes',
    'preset': '-preset',
    'pixelFormat': '-pix_fmt'
};

Object.keys(commandArgs).forEach(function (key) {
    FfmpegCommand.prototype[key] = function (arg) {
        this._current.options[key] = [commandArgs[key], arg];
        return this;
    }
});

_.assign(FfmpegCommand.prototype, EventEmitter.prototype, {

    ffmpegBinaryPath: 'ffmpeg',

    input: function (input, options) {
        this.index = this._inputs.length;

        this._current = {
            source: input,
            options: {}
        };
        this._inputs.push(this._current);

        if (options) {
            var self = this;
            Object.keys(options).forEach(function (key) {
                if (_.isFunction(self[key])) {
                    var params = options[key];
                    if (!_.isArray(params)) {
                        params = [options[key]];
                    }

                    self[key].apply(self, params);
                }
            });
        }

        return this;
    },

    output: function (output, options) {
        this._current = {
            target: output,
            options: {
                videoCodec: ['-vn'],
                audioCodec: ['-an']
            }
        };
        this._outputs.push(this._current);

        if (options) {
            var self = this;
            Object.keys(options).forEach(function (key) {
                if (_.isFunction(self[key])) {
                    var params = options[key];
                    if (!_.isArray(params)) {
                        params = [params];
                    }

                    self[key].apply(self, params);
                }
            });
        }

        return this;
    },

    strictMode: function (strictMode) {
        if (strictMode) {
            this._options.strictMode = ['-strict', '-2'];
        } else {
            delete this._options.strictMode;
        }

        return this;
    },

    overwrite: function (overwrite) {
        if (overwrite) {
            this._options.overwrite = ['-y'];
        } else {
            delete this._options.overwrite;
        }

        return this;
    },

    loop: function (loop) {
        if (loop) {
            this._current.options.loop = ['-loop', '1'];
        } else {
            delete this._current.options.loop;
        }

        return this;
    },

    size: function (width, height) {
        this._current.options.size = ['-s', parseInt(width, 10) + 'x' + parseInt(height, 10)];

        return this;
    },

    videoCodec: function (videoCodec) {
        if (!videoCodec) {
            this._current.options.videoCodec = ['-vn'];
        } else {
            this._current.options.videoCodec = ['-c:v', videoCodec];
        }

        return this;
    },

    audioCodec: function (audioCodec) {
        if (!audioCodec) {
            this._current.options.audioCodec = ['-an'];
        } else {
            this._current.options.audioCodec = ['-c:a', audioCodec];
        }

        return this;
    },

    complexFilter: function (complexFilter) {
        if (_.isArray(complexFilter)) {
            complexFilter = complexFilter.join(';');
        }

        this._options.complexFilter = ['-filter_complex', complexFilter];

        return this;
    },

    _getArguments: function () {
        var self = this;

        return [].concat(
            self._inputs.reduce(function (args, input) {
                // For each input, add input options, then '-i <source>'
                return args.concat(
                    Object.keys(input.options).reduce(function (args, current) {
                        return args.concat(input.options[current]);
                    }, []),
                    ['-i', input.source]
                );
            }, []),

            Object.keys(self._options).reduce(function (args, current) {
                return args.concat(self._options[current]);
            }, []),

            self._outputs.reduce(function (args, output) {
                // For each output, add output options, then '<target>'
                return args.concat(
                    Object.keys(output.options).reduce(function (args, current) {
                        return args.concat(output.options[current]);
                    }, []),
                    [output.target]
                );
            }, [])
        );
    },

    run: function (callback) {
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

                    callback(false, stdout, stderr);
                    //self.emit('end');
                }
            }
        }

        var args = this._getArguments();

        stdout += this.ffmpegBinary() + ' ' + args.join(' ') + "\n";
        this.ffmpegProc = spawn(this.ffmpegBinary(), args);
        self.emit('start', this.ffmpegBinary() + ' ' + args.join(' '));

        if (this.ffmpegProc.stderr) {
            this.ffmpegProc.stderr.setEncoding('utf8');
        }

        this.ffmpegProc.on('error', function (err) {
            emitEnd(err);
        });

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
        });

        this.ffmpegProc.stderr.on('close', function () {
            stderrClosed = true;
            emitEnd();
        });

        return this;
    },

    kill: function (signal) {
        if (this.ffmpegProc) {
            this.ffmpegProc.kill(signal || 'SIGKILL');
        }

        return this;
    }

});

module.exports = FfmpegCommand;
