const pathRoot = '../..'
const pathPlop = '..'
const {fileContains, bumpComVer, readComVer} = require('../helper')

module.exports = {
	description: 'Add a new Route to both Core & Shell',
	prompts: [
		{
			type: 'input',
			name: 'name',
			message: 'Route name? ( flat routes only at this time )'
		},
		{
			type: 'list',
			name: 'verb',
			message: 'What REST Verb is to be used?',
			choices: ['delete', 'get', 'patch', 'post', 'put']
		},
		{
			type: 'input',
			name: 'functionName',
			message: 'First Function Name to be used in Data Pipeline?'
		}
	],
	actions: answers => {
		const comVer = readComVer({type: 'routes', name: answers.name}).split('.')

		// Mutate Upstream to allow HandleBar convenience
		answers.verMajor = comVer[0]
		answers.verMinor = comVer[1]

		const actions = [
			{
				path: `${pathRoot}/core/routes/{{ kebabCase name }}/{{ lowerCase verb }}/index.js`,
				skipIfExists: true,
				templateFile: `${pathPlop}/core/route/index.js`,
				type: `add`
			},
			{
				path: `${pathRoot}/core/routes/{{ kebabCase name }}/{{ lowerCase verb }}/index.spec.js`,
				skipIfExists: true,
				templateFile: `${pathPlop}/core/route/index.spec.js`,
				type: `add`
			},
			{
				path: `${pathRoot}/core/routes/{{ kebabCase name }}/{{ lowerCase verb }}/v{{ verMajor }}.js`,
				skipIfExists: true,
				templateFile: `${pathPlop}/core/route/v.js`,
				type: `add`
			},
			{
				path: `${pathRoot}/core/routes/{{ kebabCase name }}/{{ lowerCase verb }}/v{{ verMajor }}.spec.js`,
				skipIfExists: true,
				templateFile: `${pathPlop}/core/route/v.spec.js`,
				type: `add`
			},
			{
				path: `${pathRoot}/shell/routes/{{ kebabCase name }}.js`,
				skipIfExists: true,
				templateFile: `${pathPlop}/shell/route.js`,
				type: `add`
			},
			{
				path: `${pathRoot}/shell/routes/{{ kebabCase name }}.js`,
				pattern: '/* PlopInjection:routeVerb */',
				template: `const {{ constantCase verb }} = require('^core/routes/{{ kebabCase name }}/{{ lowerCase verb }}/index')`,
				type: 'append'
			},
			{
				path: `${pathRoot}/shell/routes/{{ kebabCase name }}.js`,
				pattern: '/* PlopInjection:routeName */',
				templateFile: `${pathPlop}/shell/route-verison.hbs`,
				type: 'append'
			},
			{
				path: `${pathRoot}/shell/routes/{{ kebabCase name }}.schema.js`,
				skipIfExists: true,
				templateFile: `${pathPlop}/shell/route.schema.js`,
				type: `add`
			},
			answers =>
				bumpComVer({
					type: 'routes',
					name: answers.name
				})
		]

		if (
			!fileContains({
				filePath: `${process.cwd()}/shell/routes/${answers.name}.schema.js`,
				text: `${answers.verMajor}.${answers.verMinor}`
			})
		) {
			actions.push({
				path: `${pathRoot}/shell/routes/{{ kebabCase name }}.schema.js`,
				pattern: '/* PlopInjection:addVersion */',
				templateFile: `${pathPlop}/shell/schema-version.hbs`,
				type: 'append'
			})
		}

		if (
			!fileContains({
				filePath: `${process.cwd()}/index.js`,
				text: `^shell/routes/${answers.name.toLowerCase()}`
			})
		) {
			actions.push({
				path: `${pathRoot}/index.js`,
				pattern: '/* PlopInjection:routeName */',
				template: ".register(require('^shell/routes/{{ lowerCase name }}'))",
				type: 'append'
			})
		}

		return actions
	}
}
