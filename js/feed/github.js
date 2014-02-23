(function() {
'use strict';

Timeline.Stream.type.GitHub = {
	api: 'https://api.github.com/',

	headers: {
		Accept: 'application/vnd.github.v3+json',
	},

	pages: 2,
	fill: function fillGitHub(done) {
		var self = this;

		this.get(this.stream + '/events/public?page=' + this.page, function(events) {
			events.forEach(function(event) {
				self.messages.push({
					date: new Date(event.created_at).valueOf(),
					message: 'GitHub: ' + event.actor.login + ' ' + event.type,
				});
			});

			done();
		});
	},
};

})();
