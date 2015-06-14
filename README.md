# ffmpeg-wrap
[![bitHound Score](https://www.bithound.io/github/stephenmudra/ffmpeg-wrap/badges/score.svg?)](https://www.bithound.io/github/stephenmudra/ffmpeg-wrap) [![Build Status](https://travis-ci.org/stephenmudra/ffmpeg-wrap.svg)](https://travis-ci.org/stephenmudra/ffmpeg-wrap)

A basic Node FFMpeg wrapper, easy to use, chainable ffmpeg cli generator and runner.

## Examples
Set FFMpeg Path, by default it uses whatever is in the path
```FfmpegCommand.ffmpegBinary('path/to/ffmpeg')```

Basic convert file.mov to file.mp4 using ffmpeg default settings
```var command = new FfmpegCommand(); // Returns a FfmpegComand Class
var input = command.input('path/to/file.mov'); // Returns a FfmpegInput Class
var output = command.output('path/to/file.mp4') // Returns a FfmpegOutput Class
command.on('end', function () { console.log('done'); });
command.on('error', function (err) { console.error(err); });
command.run(); // Spawns the ffmpeg Command```


