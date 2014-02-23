(function() {
'use strict';

function Stream(options) {
	this.type = options.type;
	this.stream = options.stream;

	this.options = options;

	this.feeder = Stream.type[this.type];

	this.page = 0;
	this.pages = this.feeder.pages || 1;
	this.messages = [];

	var self = this;
	this.fill(function done() {
		if (!self.full())
			self.fill(done);
		else
			self.ready();
	});
}

Stream.type = {};

Stream.prototype.fill = function(callback) {
	this.page++;
	this.feeder.fill.call(this, callback || function() {});
};

Stream.prototype.full = function() {
	return this.page >= this.pages;
};

Stream.prototype.now = function() {
	if (this.messages.length)
		return this.messages[0].date;

	return 0;
};

Stream.prototype.shift = function(callback) {
	if (this.end())
		return false;

	return this.messages.shift();
};

Stream.prototype.end = function() {
	return !this.messages.length;
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

	Object.keys(this.feeder.params).forEach(function(key) {
		var val = self.feeder.params[key];

		if (typeof val == 'function')
			val = val();
		else if (val == '?')
			val = self._callback(callback);

		params += '&' + key + '=' + val;
	});

	return '?' + params.substr(1);
};

Stream.prototype.get = function(path, callback) {
	var url = this.feeder.api + path;
	var self = this;

	if (this.feeder.jsonp) {
		var s = document.createElement('script');
		s.src = url + this._params(callback);
		document.body.appendChild(s);
	} else {
		var xhr = new XMLHttpRequest();
		xhr.open('GET', url);
		xhr.send();

		xhr.onreadystatechange = function() {
			if (xhr.readyState == 4 && xhr.status == 200)
				callback.call(self, self.feeder.xml ? xhr.responseXML : JSON.parse(xhr.responseText));
		};
	}
};

Timeline.Stream = Stream;
})();
