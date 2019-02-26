/* eslint unicorn/filename-case: 0 */
/* eslint camelcase: 0 */

const {Model} = require('./BaseModel')
const softDelete = require('objection-soft-delete')

module.exports = class {{ properCase name }} extends softDelete({columnName: 'is_archived'})(
	Model
) {
	static get tableName() {
		return '{{ lowerCase name }}'
	}

	static get jsonSchema() {
		return {
			type: 'object',
			required: [],
			properties: {
				id: {type: 'integer'},
				is_archived: {type: 'boolean', default: false}
			}
		}
	}

	static get relationMappings() {
		return {
			{{ lowerCase relatetomodel }}: {
				relation: Model.{{ relationship }},
				modelClass: `${__dirname}/{{ properCase relatetomodel }}`,
				join: {
					from: '{{ lowerCase name }}.id',
					to: '{{ lowerCase relatetomodel }}.id'
				},
				filter: f => {
					f.whereNotDeleted()
				}
			}
		}
	}
}
