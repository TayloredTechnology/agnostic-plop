const schema = require(__filename.replace('.js', '.schema.js'))
// Database Model(s) Require
// const {Users} = require('^iface/db/models/index')

// Core Algorithm Require
const {{ constantCase verb }} = require('^core/routes/{{ kebabCase name }}/{{ kebabCase verb }}/index')

module.exports = async (fastify, options) => {
	fastify
		.addHook('preHandler', fastify.auth([fastify.permittedRouteSession]))
			/* PlopInjection:routeName */
}
