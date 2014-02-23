(function() {
'use strict';

function Timeline(settings) {
	this.streams = settings.streams.map(function(stream) {
		return new Timeline.Stream(stream);
	});
}

Timeline.prototype.get = function(callback) {
};

window.Timeline = Timeline;

})();
