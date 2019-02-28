'use strict'

module.exports = function(plop) {
	plop.setWelcomeMessage('Inject a Bumped ComVer into the MicroService')
	plop.setGenerator(
		'schema (internal)',
		require('../generators/version/schema.js')
	)
	plop.setGenerator(
		'route (endpoint)',
		require('../generators/version/route.js')
	)
}
