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
		self.next(20);
		return false;
	};

	this.element.appendChild(this.messages);
	this.element.appendChild(next);

	this.ready = false;
	function ready() {
		if (++count == self.streams.length) {
			self.ready = true;
			self.next(150);
		}
	}

	this.streams = [];
	settings.streams.forEach(function(stream) {
		if (typeof Timeline.Stream.source[stream.type] == 'undefined')
			return;

		var str = new Timeline.Stream(stream);
		str.ready = ready;
		self.streams.push(str);
	});

	(function poll() {
		setTimeout(poll, 2 * 60000);

		if (!self.ready)
			return;

		var buffers = [];
		var count = 0;
		var length = 0;

		function ready(mesgs) {
			buffers.push(mesgs.reverse());
			length += mesgs.length;

			if (++count != self.streams.length)
				return;

			var buffer;
			for (var i=0; i<length; i++) {
				buffer = buffers[0];
				for (var m=1; m<buffers.length; m++) {
					if (!buffer.length || (buffers[m].length && buffer[0].date < buffers[m][0].date))
						buffer = buffers[m];
				}

				if (buffer.length)
					self.display(buffer.shift(), true);
			}
		}

		self.streams.forEach(function(stream) {
			stream.poll(ready);
		});
	})();
}

var _ = Timeline.helpers = {
	parseTime: function(stamp) {
		stamp = new Date(stamp).valueOf().toString();
		return parseInt(stamp.substr(0, stamp.length - 3), 10);
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

Timeline.prototype.display = function(message, prepend) {
	var div = document.createElement('div');
	var date = document.createElement('div');
	var type = message.type.toLowerCase().replace(/\W/g, '-');

	div.className = 'message message-' + type;
	div.innerHTML = _.template('<i class="fa fa-' + Timeline.Stream.source[message.type].icon + '"></i> {message}', message);

	date.className = 'message-date message-' + type + '-date';
	date.innerHTML = new Date(message.date * 1000).toLocaleString();
	date.setAttribute('data-timestamp', message.date);

	if (message.link)
		div.setAttribute('data-link', message.link);

	div.onclick = function(event) {
		if (event.target.tagName != 'A' && message.link)
			window.open(message.link);
	};

	if (prepend) {
		this.messages.insertBefore(div, this.messages.firstChild);
		this.messages.insertBefore(date, this.messages.firstChild);
	} else {
		this.messages.appendChild(date);
		this.messages.appendChild(div);
	}
};

Timeline.prototype.next = function(n, count) {
	var stream = this.streams[0];
	var streams = this.streams.length;
	count = count || 0;

	for (var i=0; i<streams; i++) {
		if (this.streams[i].current() > stream.current())
			stream = this.streams[i];
	}

	if (stream.empty() || ++count > n)
		return;

	var self = this;
	stream.shift(function shift(message) {
		self.display(message);
		self.next(n, count);
	});
};

window.Timeline = Timeline;

})();
