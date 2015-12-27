(function() {
'use strict';

function Zenosphere(settings) {
	var count = 0;

	this.element = document.querySelector(settings.element) || document.createElement('div');
	this.messages = document.createElement('div');
	this.messages.className = 'messages';

	var next = document.createElement('a');
	next.href = '#';
	next.innerHTML = 'Load more';
	next.onclick = (function() {
		this.next(150);
		return false;
	}).bind(this);

	this.element.appendChild(this.messages);
	this.element.appendChild(next);

	this.ready = false;
	var ready = (function() {
		if (++count === this.streams.length) {
			this.ready = true;
			this.next(150);
		}
	}).bind(this);

	this.streams = [];
	settings.streams.forEach((function(stream) {
		if (typeof Zenosphere.Stream.source[stream.type] === 'undefined') {
			return;
		}

		var str = new Zenosphere.Stream(stream);
		str.ready = ready;
		this.streams.push(str);
	}).bind(this));

	(function poll() {
		setTimeout(poll, 2 * 60000);

		if (!this.ready) {
			return;
		}

		var buffers = [];
		var count = 0;
		var length = 0;

		var ready = (function(mesgs) {
			buffers.push(mesgs.reverse());
			length += mesgs.length;

			if (++count !== this.streams.length) {
				return;
			}

			var buffer;
			for (var i=0; i<length; i++) {
				buffer = buffers[0];
				for (var m=1; m<buffers.length; m++) {
					if (!buffer.length ||
					    (buffers[m].length &&
					     buffer[0].date < buffers[m][0].date)) {
						buffer = buffers[m];
					}
				}

				if (buffer.length) {
					this.display(buffer.shift(), true);
				}
			}

			this.updateTime();
		}).bind(this);

		this.streams.forEach(function(stream) {
			stream.poll(ready);
		});
	}).bind(this)();
}

var _ = Zenosphere.helpers = {
	parseTime: function(stamp) {
		stamp = new Date(stamp).valueOf().toString();
		return parseInt(stamp.substr(0, stamp.length - 3), 10);
	},

	fuzzyTime: function(stamp) {
		var diff = Math.floor((Date.now() - stamp * 1000) / 1000);

		if (diff < 2) {
			return 'just now';
		} else if (diff < 60) {
			return diff + 's ago';
		} else if (diff < 3600) {
			return Math.ceil(diff / 60) + 'm ago';
		} else if (diff < 60 * 60 * 23) {
			return Math.ceil(diff / 60 / 60) + 'h ago';
		} else if (diff < 60 * 60 * 24 * 6) {
			return Math.ceil(diff / 60 / 60 / 24) + 'd ago';
		} else {
			return Math.ceil(diff / 60 / 60 / 24 / 7) + 'w ago';
		}

		return new Date(stamp * 1000).toLocaleString();
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

			if (typeof val === 'object') {
				val = new val.constructor(val);
			}

			to[key === 'fill' ? '_fill' : key] = val;
		});
	},
};

Zenosphere.prototype.updateTime = function() {
	[].forEach.call(this.messages.children, function(message) {
		message.firstChild.innerHTML = _.fuzzyTime(message.getAttribute('data-timestamp'));
	});
};

Zenosphere.prototype.display = function(message, prepend) {
	var div = document.createElement('div');
	var body = document.createElement('span');
	var date = document.createElement('span');
	var icon = document.createElement('i');
	var type = message.type.toLowerCase().replace(/\W/g, '-');

	div.className = 'message message-' + type;
	div.setAttribute('data-timestamp', message.date);

	icon.className = 'fa fa-' + Zenosphere.Stream.source[message.type].icon;

	body.className = 'message-body';
	body.innerHTML = ' ' + message.message;

	date.className = 'message-date';
	date.innerHTML = _.fuzzyTime(message.date);

	if (message.link) {
		div.setAttribute('data-link', message.link);
	}

	div.onclick = function(event) {
		if (event.target.tagName !== 'A' && message.link) {
			window.open(message.link);
		}
	};

	div.appendChild(date);
	div.appendChild(icon);
	div.appendChild(body);

	// finish up here if we only have to append
	if (!prepend) {
		return this.messages.appendChild(div);
	}

	var messages = this.messages.children;
	var length = messages.length;

	// step through messages until we find one that is older than the message we just received
	for (var i=0; i<length && +messages[i].getAttribute('data-timestamp') > message.date; i++); // jshint ignore:line

	this.messages.insertBefore(div, messages[i]);
};

Zenosphere.prototype.next = function(n, count) {
	var stream = this.streams[0];
	var streams = this.streams.length;
	count = count || 0;

	for (var i=1; i<streams; i++) {
		if (this.streams[i].current() > stream.current()) {
			stream = this.streams[i];
		}
	}

	if (stream.empty() || ++count > n) {
		return;
	}

	stream.shift((function shift(message) {
		this.display(message);
		this.next(n, count);
	}).bind(this));
};

window.Zenosphere = Zenosphere;

})();
