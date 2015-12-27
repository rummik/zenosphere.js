(function() {
'use strict';

/* global Zenosphere */
var _ = Zenosphere.helpers;

function Stream(options) {
	_.copy(this, Stream.source[options.type]);

	this.vars = {};
	_.copy(this.vars, options);

	this.buffer = [];

	this.results = {
		max: 0,
		min: 0,
	};

	if (this.options.paginate) {
		this.vars.page = 0;
	}

	setTimeout((function() {
		this.fill(this.ready);
	}).bind(this), 1);
}

Stream.type = {};
Stream.source = {};

Stream.prototype.poll = function(callback) {
	this.request('poll', callback);
};

Stream.prototype.fill = function(callback) {
	this.request(this.results.min ? 'refill' : 'fill', (function(messages) {
		this.buffer = messages;
		callback();
	}).bind(this));
};

Stream.prototype.request = function(action, callback) {
	var path;
	action = action || 'fill';

	if (typeof this.options.action === 'string') {
		path = this.options.action;
	} else {
		path = this.options.action[action] || this.options.action.fill;
	}

	if (this.options.paginate && action !== 'poll') {
		this.vars.page++;
	}

	this.get(_.template(path, this.vars), action, function(data) {
		var messages = [];
		var events = this.getEvents(data);

		if (!events.length) {
			return callback(messages);
		}

		events.forEach((function(event) {
			var id = this.getEventID(event);
			var message;

			if (action === 'poll' && id <= this.results.max) {
				return;
			}

			if (action === 'refill' && id >= this.results.min) {
				return;
			}

			if (!(message = this.getEventMessage(event))) {
				return;
			}

			messages.push({
				type: this.vars.type,
				date: this.getEventDate(event),
				message: message,
				link: this.getEventLink(event),
			});
		}).bind(this));

		if (!this.results.max || action === 'poll') {
			this.results.max = this.getEventID(events[0]);
		}

		if (!this.results.min || action === 'fill' || action === 'refill') {
			this.results.min = this.getEventID(events[events.length - 1]);
		}

		if (typeof callback === 'function') {
			callback(messages);
		}
	});
};

/**
 * Get the date for the current message
 * @returns {integer} Date when message was published
 */
Stream.prototype.current = function() {
	if (this.buffer.length) {
		return this.buffer[0].date;
	}

	return 0;
};

/**
 * Get the next message in our stream
 * @param {function} callback(message)  Callback with message
 */
Stream.prototype.shift = function(callback) {
	if (this.buffer.length <= 1 &&
	    (!this.options.paginate ||
	     (this.options.paginate !== true &&
	      this.vars.page < this.options.paginate))) {
		return this.fill(this.shift.bind(this, callback));
	} else if (this.empty()) {
		return;
	}

	callback(this.buffer.shift());
};

/**
 * Find out if the stream is empty
 * @returns {boolean} True if empty, false otherwise
 */
Stream.prototype.empty = function() {
	return !this.buffer.length &&
	       this.options.paginate &&
	       this.options.paginate !== true &&
	       this.vars.page >= this.options.paginate;
};

/**
 * Generates a global callback from a callback
 *
 * @param {function} callback  Thing to ring
 * @returns {string} Our callback
 */
Stream.prototype._callback = function(callback) {
	var cb = 'timeline_cb_' + Math.random().toString().substr(2);

	window[cb] = (function() {
		callback.apply(this, arguments);
		delete window[cb];
	}).bind(this);

	return cb;
};

Stream.prototype._params = function(action) {
	var params = '';

	Object.keys(this.params).forEach((function(key) {
		var val = this.params[key];

		if (typeof val === 'function') {
			val = val.call(this, action);
		}

		if (val === undefined) {
			return;
		}

		params += '&' + key + '=' + _.template(val, this.vars);
	}).bind(this));

	return '?' + params.substr(1);
};

Stream.prototype.get = function(path, action, callback) {
	var url = this.options.url + path +
		  this._params(arguments.length === 3 ? action : '');

	if (typeof callback === 'undefined') {
		callback = action;
	}

	if (this.options.response === 'jsonp') {
		var s = document.createElement('script');
		s.src = url.replace(/([?&][^=]+=)\?(&|$)/, '$1' + this._callback(callback) + '$2');
		document.body.appendChild(s);
	} else {
		var xhr = new XMLHttpRequest();
		xhr.open('GET', url);
		xhr.send();

		xhr.onreadystatechange = (function() {
			if (xhr.readyState === 4 && xhr.status === 200) {
				callback.call(
					this,
					this.options.response === 'xml' ?
					xhr.responseXML :
					JSON.parse(xhr.responseText)
				);
			}
		}).bind(this);
	}
};

Zenosphere.Stream = Stream;
})();
