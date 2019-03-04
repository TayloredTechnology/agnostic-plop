'use strict'
global.config = require('config')

module.exports = function(plop) {
	plop.setGenerator('new', require('../generators/new/route'))
}
