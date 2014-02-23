(function() {
'use strict';

Timeline.Stream.type['Last.fm'] = {
	api: '//ws.audioscrobbler.com/2.0/',
	xml: true,

	fill: function fillLastfm(done) {
		var self = this;

		this.get('user/' + this.stream + '/recenttracks.rss?limit=100', function(data) {
			var tracks = [].slice.apply(data.querySelectorAll('item'));

			self.messages = tracks.map(function(track) {
				return {
					date: new Date(track.querySelector('pubDate').innerHTML).valueOf(),
					message: track.querySelector('title').innerHTML,
				};
			});

			done();
		});
	},
};

})();
