(function() {
'use strict';

Timeline.Stream.type.Twitter = {
	api: 'https://cdn.syndication.twimg.com/widgets/timelines/',
	jsonp: true,

	params: {
		lang: 'en',
		suppress_response_codes: 'true',
		rnd: function() { return Math.random(); },
		callback: '?',

		max_id: function() {
			if (this.max_id)
				return this.max_id;
		},
	},

	pages: 3,
	fill: function fillTwitter(done) {
		var self = this;

		this.get((this.page > 1 ? 'paged/' : '') + this.stream, function(data) {
			var doc = document.implementation.createHTMLDocument('twitter');
			doc.body.innerHTML = data.body;

			var tweets = [].slice.apply(doc.querySelectorAll('.tweet'));

			self.max_id = tweets[tweets.length - 1].getAttribute('data-tweet-id');

			tweets.forEach(function(tweet) {
				self.messages.push({
					date: new Date(tweet.querySelector('.permalink').getAttribute('data-datetime')).valueOf(),
					message: tweet.querySelector('.e-entry-title').innerHTML.replace(/<.+?>/g, ''),
				});
			});

			done();
		});
	},
};

})();
