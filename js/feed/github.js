(function() {
'use strict';

var _ = Timeline.helpers;

Timeline.Stream.type.GitHub = {
	api: 'https://api.github.com/',

	headers: {
		Accept: 'application/vnd.github.v3+json',
	},

	pages: 10,
	fill: function fillGitHub(done) {
		var self = this;

		this.get(this.stream + '/events/public?page=' + this.page, function(events) {
			if (!self.received.high)
				self.received.high = _.parseTime(events[0].created_at);

			events.forEach(function(event) {
				var date = _.parseTime(event.created_at);

				if (self.received.low && date > self.received.low)
					return;

				self.messages.push({
					date: date,
					message: 'GitHub: ' + event.actor.login + ' ' + event.type,
				});
			});

			self.received.low = _.parseTime(events[events.length - 1].created_at);

			done();
		});
	},

	latest: function latestGitHub(done) {
		done();
	},
};

})();
