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

	this.fill();
}

Stream.type = {};

Stream.prototype.fill = function(callback) {
	this.page++;
	this.feeder.fill.call(this, callback || function() {});
};

Stream.prototype.date = function() {
	if (this.messages.length)
		return this.messages[0].date;

	return 0;
};

Stream.prototype.next = function(callback) {
	if (this.end())
		return false;

	if (!this.messages.length)
		return this.fill(this.next.bind(this, callback));

	callback(this.messages.shift());
};

Stream.prototype.end = function() {
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
