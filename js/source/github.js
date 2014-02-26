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
		page: function(action) {
			return (action == 'poll') ? 1 : '{page}';
		},
	},

	headers: {
		Accept: 'applicatioin/vnd.github.v3+json',
	},

	getEvents: function(data) {
		return data;
	},

	getEventID: function(event) {
		return parseInt(this.getEventDate(event), 10);
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
