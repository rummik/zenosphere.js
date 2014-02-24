(function() {
'use strict';

Timeline.Stream.type['Last.fm'] = {
	api: 'https://ws.audioscrobbler.com/2.0/',
	xml: true,

	pages: 4,
	fill: function fillLastfm(done) {
		var self = this;
		var from = this.received.low > 0 ? '&to=' + this.received.low : '';

		this.get('user/' + this.stream + '/recenttracks.rss?limit=50' + from, function(data) {
			var tracks = [].slice.apply(data.querySelectorAll('item'));

			if (self.received.high == -1) {
				var high = new Date(tracks[0].querySelector('pubDate').innerHTML).valueOf().toString();
				self.received.high = high.substr(0, high.length - 3);
			}

			var low = new Date(tracks[tracks.length - 1].querySelector('pubDate').innerHTML).valueOf().toString();
			self.received.low = low.substr(0, low.length - 3);

			tracks.forEach(function(track) {
				self.messages.push({
					date: new Date(track.querySelector('pubDate').innerHTML).valueOf(),
					message: track.querySelector('title').innerHTML,
				});
			});

			done();
		});
	},
};

})();
