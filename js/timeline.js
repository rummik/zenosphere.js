(function() {
'use strict';

function Timeline(settings) {
	var self = this;
	var count = 0;

	this.element = document.querySelector(settings.element) || document.createElement('div');
	this.messages = document.createElement('div');
	this.messages.className = 'messages';

	var next = document.createElement('a');
	next.href = '#';
	next.innerHTML = 'Load more';
	next.onclick = function() {
		self.display(20);
		return false;
	};

	this.element.appendChild(this.messages);
	this.element.appendChild(next);

	function ready() {
		if (++count == self.streams.length)
			self.display(80);
	}

	this.streams = [];
	settings.streams.forEach(function(stream) {
		if (typeof Timeline.Stream.source[stream.type] == 'undefined')
			return;

		var str = new Timeline.Stream(stream);
		str.ready = ready;
		self.streams.push(str);
	});
}

var _ = Timeline.helpers = {
	parseTime: function(stamp) {
		stamp = new Date(stamp).valueOf().toString();
		return parseInt(stamp.substr(0, stamp.length - 3));
	},

	template: function(text, data) {
		return text.toString().replace(/{(\w+)}/g, function(m, key) {
			return data[key];
		});
	},

	toArray: function(iterable) {
		return [].slice.apply(iterable);
	},

	copy: function(to, from) {
		Object.keys(from).forEach(function clone(key) {
			var val = from[key];

			if (typeof val == 'object')
				val = new val.constructor(val);

			to[key == 'fill' ? '_fill' : key] = val;
		});
	},
};

Timeline.prototype.display = function(count) {
	var self = this;
	var n = 0;

	this._nextMessage(function display(message) {
		var div = document.createElement('div');
		div.className = 'message message-' + message.type.toLowerCase().replace(/\W/g, '-');
		div.innerHTML = _.template('<i class="fa fa-' + Timeline.Stream.source[message.type].icon + '"></i> {message}', message);

		div.onclick = function(event) {
			if (event.target === this && message.link)
				window.open(message.link);
		};

		self.messages.appendChild(div);

		if (++n <= count)
			self._nextMessage(display);
	});
};

Timeline.prototype._nextMessage = function(callback) {
	var stream = this.streams[0];
	var streams = this.streams.length;

	for (var i=0; i<streams; i++) {
		if (this.streams[i].current() > stream.current())
			stream = this.streams[i];
	}

	if (!stream.empty())
		stream.shift(callback);
};

window.Timeline = Timeline;

})();
