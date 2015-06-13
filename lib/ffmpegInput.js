'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

var _ffmpegBase = require('./ffmpegBase');

var _ffmpegBase2 = _interopRequireDefault(_ffmpegBase);

var FfmpegInput = (function (_FfmpegBase) {
	function FfmpegInput() {
		_classCallCheck(this, FfmpegInput);

		if (_FfmpegBase != null) {
			_FfmpegBase.apply(this, arguments);
		}
	}

	_inherits(FfmpegInput, _FfmpegBase);

	_createClass(FfmpegInput, [{
		key: 'index',
		get: function () {
			return this._ffmpeg._inputs.indexOf(this);
		}
	}, {
		key: 'inputArgs',
		get: function () {
			var _this = this;

			return [].concat(Object.keys(this._options).reduce(function (args, current) {
				return args.concat(_this._options[current]);
			}, []), ['-i', this._file]);
		}
	}]);

	return FfmpegInput;
})(_ffmpegBase2['default']);

exports['default'] = FfmpegInput;
module.exports = exports['default'];