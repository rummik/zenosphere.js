(function() {
'use strict';

function Stream(options) {
	var self = this;

	this.type = options.type;
	this.stream = options.stream;

	this.options = options;

	this.page = 0;
	this.pages = 1;
	this.messages = [];

	this.received = {
		high: undefined,
		low: undefined,

		init: function(high) {
			if (!this.high)
				this.high = high;
		},
	};

	Object.keys(Stream.type[this.type]).forEach(function clone(key) {
		var val = Stream.type[self.type][key];

		if (typeof val == 'object')
			val = new val.constructor(val);

		self[key == 'fill' ? '_fill' : key] = val;
	});

	setTimeout(function() {
		self.fill(self.ready);
	}, 1);
}

Stream.type = {};

Stream.prototype.fill = function(callback) {
	this.page++;
	this._fill.call(this, callback || function() {});
};

Stream.prototype.now = function() {
	if (this.messages.length)
		return this.messages[0].date;

	return 0;
};

Stream.prototype.read = function(callback) {
	if (this.messages.length <= 1 && this.page < this.pages)
		return this.fill(this.read.bind(this, callback));
	else if (this.empty())
		return;

	var message = this.messages.shift();
	message.type = this.type;
	callback(message);
};

Stream.prototype.empty = function() {
	return this.page >= this.pages && !this.messages.length;
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

Stream.prototype._params = function(callback) {
	var self = this;
	var params = '';

	Object.keys(this.params).forEach(function(key) {
		var val = self.params[key];

		if (typeof val == 'function')
			val = val.call(self);
		else if (val == '?')
			val = self._callback(callback);

		if (val == undefined)
			return;

		params += '&' + key + '=' + val;
	});

	return '?' + params.substr(1);
};

Stream.prototype.get = function(path, callback) {
	var url = this.api + path;
	var self = this;

	if (this.jsonp) {
		var s = document.createElement('script');
		s.src = url + this._params(callback);
		document.body.appendChild(s);
	} else {
		var xhr = new XMLHttpRequest();
		xhr.open('GET', url);
		xhr.send();

		xhr.onreadystatechange = function() {
			if (xhr.readyState == 4 && xhr.status == 200)
				callback.call(self, self.xml ? xhr.responseXML : JSON.parse(xhr.responseText));
		};
	}
};

Timeline.Stream = Stream;
})();
