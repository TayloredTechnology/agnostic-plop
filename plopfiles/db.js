'use strict'
global.config = require('config')

module.exports = function(plop) {
	plop.setGenerator('new route', require('../generators/new/route'))
}
