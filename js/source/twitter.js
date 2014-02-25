(function() {
'use strict';

var _ = Timeline.helpers;

Timeline.Stream.source.Twitter = {
	icon: 'twitter',

	options: {
		response: 'jsonp',
		url: 'https://cdn.syndication.twimg.com/widgets/timelines/',
		action: {
			fill: '{stream}',
			poll: 'paged/{stream}',
			refill: 'paged/{stream}',
		},
	},

	params: {
		lang: 'en',
		suppress_response_codes: 'true',
		rnd: function() { return Math.random(); },
		domain: location.host,
		callback: '?',

		since_id: function(action) {
			if (action == 'poll')
				return this.results.max;
		},

		max_id: function(action) {
			if (action == 'refill')
				return this.results.min;
		},
	},

	getEvents: function(data) {
		var doc = document.implementation.createHTMLDocument('twitter');
		doc.body.innerHTML = data.body;
		return _.toArray(doc.querySelectorAll('.tweet'));
	},

	getEventID: function(event) {
		return event.getAttribute('data-tweet-id');
	},

	getEventDate: function(event) {
		return _.parseTime(event.querySelector('.permalink').getAttribute('data-datetime'));
	},

	getEventMessage: function(event) {
		var message = event.querySelector('.e-entry-title');
		
		_.toArray(message.querySelectorAll('a')).forEach(function(a) {
			a.target = '_blank';
		});

		_.toArray(message.querySelectorAll('span.tco-hidden')).forEach(function(span) {
			span.parentNode.removeChild(span);
		});

		return message.innerHTML;
	},

	getEventLink: function(event) {
		return event.querySelector('.permalink').href;
	},
};

})();
