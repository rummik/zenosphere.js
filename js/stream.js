(function() {
'use strict';

var _ = Timeline.helpers;

function Stream(options) {
	_.copy(this, Stream.source[options.type]);

	this.vars = {};
	_.copy(this.vars, options);

	this.buffer = [];

	this.results = {
		max: 0,
		min: 0,
	};

	if (this.options.paginate)
		this.vars.page = 0;

	var self = this;
	setTimeout(function() {
		self.fill(self.ready);
	}, 1);
}

Stream.type = {};
Stream.source = {};

Stream.prototype.poll = function(callback) {
	this.request('poll', callback);
};

Stream.prototype.fill = function(callback) {
	var self = this;
	this.request(this.results.min ? 'refill' : 'fill', function(messages) {
		self.buffer = messages;
		callback();
	});
};

Stream.prototype.request = function(action, callback) {
	var path;
	action = action || 'fill';

	if (typeof this.options.action == 'string')
		path = this.options.action;
	else
		path = this.options.action[action] || this.options.action['fill'];

	if (this.options.paginate && action != 'poll')
		this.vars.page++;

	this.get(_.template(path, this.vars), action, function(data) {
		var self = this;
		var messages = [];
		var events = this.getEvents(data);

		events.forEach(function(event) {
			var id = self.getEventID(event);
			var message;

			if (action == 'poll' && id < self.results.max)
				return;

			if (action == 'refill' && id > self.results.min)
				return;

			if (!(message = self.getEventMessage(event)))
				return;

			messages.push({
				type: self.vars.type,
				date: self.getEventDate(event),
				message: message,
				link: self.getEventLink(event),
			});
		});

		if (!this.results.max || action == 'poll')
			this.results.max = this.getEventID(events[0]);

		if (!this.results.min || action == 'fill' || action == 'refill')
			this.results.min = this.getEventID(events[events.length - 1]);

		if (typeof callback == 'function')
			callback(messages);
	});
};

/**
 * Get the date for the current message
 * @returns {integer} Date when message was published
 */
Stream.prototype.current = function() {
	if (this.buffer.length)
		return this.buffer[0].date;

	return 0;
};

/**
 * Get the next message in our stream
 * @param {function} callback(message)  Callback with message
 */
Stream.prototype.shift = function(callback) {
	if (this.buffer.length <= 1 && (!this.options.paginate || (this.options.paginate !== true && this.vars.page < this.options.paginate)))
		return this.fill(this.shift.bind(this, callback));
	else if (this.empty())
		return;

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
	var self = this;

	window[cb] = function() {
		callback.apply(self, arguments);
		delete window[cb];
	};

	return cb;
};

Stream.prototype._params = function(action) {
	var self = this;
	var params = '';

	Object.keys(this.params).forEach(function(key) {
		var val = self.params[key];

		if (typeof val == 'function')
			val = val.call(self, action);

		if (val == undefined)
			return;

		params += '&' + key + '=' + _.template(val, self.vars);
	});

	return '?' + params.substr(1);
};

Stream.prototype.get = function(path, action, callback) {
	var url = this.options.url + path + this._params(arguments.length == 3 ? action : '');

	if (typeof callback == 'undefined')
		callback = action;

	if (this.options.response == 'jsonp') {
		var s = document.createElement('script');
		s.src = url.replace(/([?&][^=]+=)\?(&|$)/, '$1' + this._callback(callback) + '$2');
		document.body.appendChild(s);
	} else {
		var xhr = new XMLHttpRequest();
		xhr.open('GET', url);
		xhr.send();

		var self = this;
		xhr.onreadystatechange = function() {
			if (xhr.readyState == 4 && xhr.status == 200)
				callback.call(self, self.options.response == 'xml' ? xhr.responseXML : JSON.parse(xhr.responseText));
		};
	}
};

Timeline.Stream = Stream;
})();
