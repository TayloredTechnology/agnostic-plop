const fs = require('fs')

module.exports = {
	description: 'Add a new Database Model to the database interface',
	prompts: [
		{
			type: 'input',
			name: 'name',
			message: 'Name of Model? (expects lowerCase tablename of this)'
		},
		{
			type: 'list',
			name: 'relationship',
			message:
				'Relationship with other tables? (https://vincit.github.io/objection.js/#relations)',
			choices: [
				'BelongsToOneRelation',
				'HasManyRelation',
				'HasOneRelation',
				'ManyToManyRelation',
				'HasOneThroughRelation'
			]
		},
		{
			type: 'input',
			name: 'relatetomodel',
			message: 'First Model(table) to Relate to?'
		}
	],
	actions: data => {
		const actions = [
			{
				path: 'iface/db/models/BaseModel.js',
				templateFile: 'plop/iface/db/model/BaseModel.js',
				skipIfExists: true,
				type: 'add'
			},
			{
				path: 'iface/db/models/{{ properCase name }}.js',
				skipIfExists: true,
				templateFile: 'plop/iface/db/model/model.js',
				type: 'add'
			},
			{
				path: 'iface/db/seeds/{{ properCase name }}.js',
				skipIfExists: true,
				templateFile: 'plop/iface/db/seed.js',
				type: 'add'
			}
		]

		if (fs.existsSync('./iface/db/models/index.js')) {
			actions.push(
				{
					path: 'iface/db/models/index.js',
					pattern: '/* PlopInjection:modelName */',
					template: '{{ properCase name }},',
					type: 'append'
				},
				{
					path: 'iface/db/models/index.js',
					pattern: '/* PlopInjection:requireModel */',
					template:
						"const {{ properCase name }} = require('./{{ properCase name }}')",
					type: 'append'
				}
			)
		} else {
			actions.push({
				path: 'iface/db/models/index.js',
				templateFile: 'plop/iface/db/model/index.js',
				type: 'add'
			})
		}

		return actions
	}
}
