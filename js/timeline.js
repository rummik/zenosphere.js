(function() {
'use strict';

function Timeline(settings) {
	var self = this;
	var count = 0;

	this.element = document.querySelector(settings.element) || document.createElement('div');

	function ready() {
		if (++count != self.streams.length)
			return;

		if (self.element) {
			var message;
			while (message = self.shift()) {
				var div = document.createElement('div');
				div.className = 'message';
				div.innerHTML = message.message;
				self.element.appendChild(div);
			}
		}
	}

	this.streams = settings.streams.map(function(stream) {
		var str = new Timeline.Stream(stream);
		str.ready = ready;
		return str;
	});
}

Timeline.prototype.shift = function() {
	var stream = this.streams[0];
	var streams = this.streams.length;

	for (var i=0; i<streams; i++) {
		if (this.streams[i].now() > stream.now())
			stream = this.streams[i];
	}

	if (!stream.end())
		return stream.shift();

	return null;
};

window.Timeline = Timeline;

})();
