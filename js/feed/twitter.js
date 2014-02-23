(function() {
'use strict';

Timeline.Stream.type.Twitter = {
	api: '//cdn.syndication.twimg.com/widgets/timelines/',
	jsonp: true,

	params: {
		lang: 'en',
		suppress_response_codes: 'true',
		rnd: function() { return Math.random(); },
		callback: '?',
	},

	fill: function fillTwitter(done) {
		var self = this;

		this.get(this.stream, function(data) {
			var doc = document.implementation.createHTMLDocument('twitter');
			doc.body.innerHTML = data.body;

			var tweets = [].slice.apply(doc.querySelectorAll('.tweet'));
			self.messages = tweets.map(function(tweet) {
				return {
					date: new Date(tweet.querySelector('.permalink').getAttribute('data-datetime')).valueOf(),
					message: tweet.querySelector('.e-entry-title').innerHTML.replace(/<.+?>/g, ''),
				};
			});

			done();
		});
	},
};

})();
