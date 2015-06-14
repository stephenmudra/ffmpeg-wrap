# ffmpeg-wrap
[![bitHound Score](https://www.bithound.io/github/stephenmudra/ffmpeg-wrap/badges/score.svg?)](https://www.bithound.io/github/stephenmudra/ffmpeg-wrap) [![Build Status](https://travis-ci.org/stephenmudra/ffmpeg-wrap.svg)](https://travis-ci.org/stephenmudra/ffmpeg-wrap)

A basic Node FFMpeg wrapper, easy to use, chainable ffmpeg cli generator and runner.

## Usage
Install via NPM
```
npm install ffmpeg-wrap
```

Require in Node
```javascript
var FFMpeg = require('ffmpeg-wrap').FFMpeg;
```

## Examples
Set FFMpeg Path, by default it uses whatever is in the path
```javascript
FFMpeg.ffmpegBinary('path/to/ffmpeg')
```

#### Basic Input/Output
Basic convert file.mov to file.mp4 using ffmpeg default settings
```javascript
var command = new FFMpeg(); // Returns a FfmpegComand Class
var input = command.input('path/to/file.mov'); // Returns a FfmpegInput Class
var output = command.output('path/to/file.mp4') // Returns a FfmpegOutput Class
command.on('end', function () { console.log('done'); });
command.on('error', function (err) { console.error(err); });
command.run(); // Spawns the ffmpeg Command
```
This outputs and runs the ffmpeg command `ffmpeg -i path/to/file.mov path/to/file.mp4`

### Convenience Methods
Both the FFMpegInput & FFMpegOutput classes have several convenience methods linked to the FFMpegCommand for chaining
(`input, output, run, on, off, emit`). This allows the above example to be replaced with
```javascript
new FFMpeg().input('path/to/file.mov').output('path/to/file.mp4').run();
```

### Setting Input/Output Options
```javascript
new FFMpeg().input('path/to/file.pcm')
	.format('s16le')
	.audioCodec('pcm_s16le')
	.audioChannels(2)
	.audioFrequency(48000);
```
Or any options can be passed as an object on the input call 
```javascript
new FFMpeg().input('path/to/file.pcm', {
	format: 's16le',
	audioCodec: 'pcm_s16le',
	audioChannels: 2,
	audioFrequency: 48000
});
```
This outputs the ffmpeg command `ffmpeg -f s16le -c:a pcm_s16le -ac 2 -ar 48000 -i path/to/file.pcm`

