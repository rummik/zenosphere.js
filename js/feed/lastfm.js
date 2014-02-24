(function() {
'use strict';

var _ = Timeline.helpers;

Timeline.Stream.type['Last.fm'] = {
	icon: 'music',

	api: 'https://ws.audioscrobbler.com/2.0/',
	xml: true,

	params: {
		limit: 100,
		to: function() {
			if (this.received.low)
				return this.received.low;
		},
	},

	pages: 20,
	fill: function fillLastfm(done) {
		var self = this;
		var from = this.received.low ? '&to=' + this.received.low : '';

		this.get('user/' + this.stream + '/recenttracks.rss', function(data) {
			var tracks = [].slice.apply(data.querySelectorAll('item'));

			self.received.init(_.parseTime(tracks[0].querySelector('pubDate').innerHTML));

			self.received.low = _.parseTime(tracks[tracks.length - 1].querySelector('pubDate').innerHTML);

			tracks.forEach(function(track) {
				self.messages.push({
					date: _.parseTime(track.querySelector('pubDate').innerHTML),
					message: track.querySelector('title').innerHTML,
					link: track.querySelector('link').innerHTML,
				});
			});

			done();
		});
	},

	poll: function latestLastfm(done) {
		done();
	},
};

})();
