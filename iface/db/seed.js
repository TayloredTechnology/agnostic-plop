/* eslint camelcase: 0 */

const f = require('faker')
const nanoid = require('nanoid/non-secure')

const row = () => {
	return {
		id: nanoid(),
		is_archived: f.random.is_archived
	}
}

exports.seed = async knex => {
	await knex('{{ lowerCase name }}').del()
	const fakeData = []
	for (let i = 0; i < 5; i++) {
		fakeData.push(row())
	}
	return knex('{{ lowerCase name }}').insert(fakeData)
}
