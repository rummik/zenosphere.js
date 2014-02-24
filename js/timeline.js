(function() {
'use strict';

function Timeline(settings) {
	var self = this;
	var count = 0;

	this.element = document.querySelector(settings.element) || document.createElement('div');
	this.messages = document.createElement('div');

	var next = document.createElement('a');
	next.href = '#';
	next.innerHTML = 'Show 20 more';
	next.onclick = function() {
		self.display(20);
		return false;
	};

	function ready() {
		if (++count != self.streams.length)
			return;

		self.display(20);
	}

	this.streams = settings.streams.map(function(stream) {
		var str = new Timeline.Stream(stream);
		str.ready = ready;
		return str;
	});
}

Timeline.prototype.display = function(count) {
	var self = this;
	var n = 0;

	this.nextMessage(function display(message) {
		var div = document.createElement('div');
		div.className = 'message message-' + message.type.toLowerCase().replace(/\W/g, '-');
		div.innerHTML = message.message;
		self.element.appendChild(div);

		if (++n <= count)
			self.nextMessage(display);
	});
};

Timeline.prototype.nextMessage = function(callback) {
	var stream = this.streams[0];
	var streams = this.streams.length;

	for (var i=0; i<streams; i++) {
		if (this.streams[i].now() > stream.now())
			stream = this.streams[i];
	}

	if (!stream.empty())
		stream.read(callback);
};

window.Timeline = Timeline;

})();
