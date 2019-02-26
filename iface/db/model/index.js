const knex = require('knex')
const connection = require('^knexfile')
const {Model} = require('objection')

const knexConnection = knex(connection)

Model.knex(knexConnection)

/* PlopInjection:requireModel */
const {{ properCase name }} = require('./{{ properCase name }}')

module.exports = {
	/* PlopInjection:modelName */
	{{ properCase name }}
}
