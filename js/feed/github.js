(function() {
'use strict';

Timeline.Stream.type.GitHub = {
	api: 'https://api.github.com/',

	headers: {
		Accept: 'application/vnd.github.v3+json',
	},

	fill: function fillGitHub(done) {
		var self = this;

		this.get(this.stream + '/events/public', function(events) {
			self.messages = events.map(function(event) {
				return {
					date: new Date(event.created_at).valueOf(),
					message: 'GitHub: ' + event.actor.login + ' ' + event.type,
				};
			});

			done();
		});
	},
};

})();
