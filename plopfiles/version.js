'use strict'
global.config = require('config')

module.exports = function(plop) {
	plop.setWelcomeMessage('Inject a Bumped ComVer into the MicroService')
	plop.setGenerator(
		'_self (internal)',
		require('../generators/version/_self.js')
	)
	plop.setGenerator(
		'route (endpoint)',
		require('../generators/version/route.js')
	)
}
