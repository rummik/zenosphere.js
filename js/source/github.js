(function() {
'use strict';

var _ = Timeline.helpers;

Timeline.Stream.source.GitHub = {
	icon: 'github',

	options: {
		response: 'json',
		paginate: 10,
		url: 'https://api.github.com/',
		action: '{stream}/events/public',
	},

	params: {
		page: '{page}',
	},

	headers: {
		Accept: 'applicatioin/vnd.github.v3+json',
	},

	getEvents: function(data) {
		return data;
	},

	getEventID: function(event) {
		return this.getEventDate(event);
	},

	getEventDate: function(event) {
		return _.parseTime(event.created_at);
	},

	getEventMessage: function(event) {
		return 'GitHub: ' + event.actor.login + ' ' + event.type;
	},

	getEventLink: function(event) {},
};

})();