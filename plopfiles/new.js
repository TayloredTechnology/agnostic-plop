'use strict'
global.config = require('config')

module.exports = function(plop) {
	plop.setWelcomeMessage('Scaffold out a new…')
	plop.setGenerator('route (endpoint)', require('../generators/new/route'))
	plop.setGenerator('rest API (external)', require('../generators/new/rest'))
}
