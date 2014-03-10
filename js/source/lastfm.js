(function() {
'use strict';

/* global Zenosphere */
var _ = Zenosphere.helpers;

Zenosphere.Stream.source.Lastfm = {
	icon: 'music',

	options: {
		response: 'xml',
		url: 'https://ws.audioscrobbler.com/2.0/',
		action: 'user/{stream}/recenttracks.rss',
	},

	params: {
		limit: 200,

		from: function(action) {
			if (action == 'poll')
				return this.results.max;
		},

		to: function(action) {
			if (action == 'refill')
				return this.results.min;
		},
	},

	getEvents: function(data) {
		return _.toArray(data.querySelectorAll('item'));
	},

	getEventID: function(event) {
		return this.getEventDate(event);
	},

	getEventDate: function(event) {
		return _.parseTime(event.querySelector('pubDate').innerHTML);
	},

	getEventMessage: function(event) {
		return event.querySelector('title').innerHTML;
	},

	getEventLink: function(event) {
		return event.querySelector('link').innerHTML;
	},
};

})();
