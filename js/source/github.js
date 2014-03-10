(function() {
'use strict';

/* global Zenosphere */
var _ = Zenosphere.helpers;

Zenosphere.Stream.source.GitHub = {
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
		return _.parseTime(event.created_at); // jshint ignore:line
	},

	getEventMessage: function(event) {
		var message = '';
		var params = {};

		switch (event.type) {
			case 'PushEvent':
				message = 'Pushed {commits} commit{s} to <code>{ref}</code> ' +
				          'on <a href="{repoUrl}" target="_blank">{repo}</a>';

				params = {
					commits: event.payload.size,
					s: event.payload.size == 1 ? '' : 's',
					ref: event.payload.ref.replace(/^refs\/heads\//, ''),
					repoUrl: 'https://github.com/' + event.repo.name,
					repo: event.repo.name.replace(new RegExp('^' + event.actor.login + '/'), ''),
				};
				break;
		}

		if (message.length)
			return _.template(message, params);
	},

	getEventLink: function(event) {
		switch (event.type) {
			case 'PushEvent':
				return 'https://github.com/' + event.repo.name + '/compare/' + event.payload.before + '...' + event.payload.head;
		}
	},
};

})();
