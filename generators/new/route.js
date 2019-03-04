const pathRoot = '../..'
const pathPlop = '..'
const {fileContains, bumpComVer, readComVer} = require('../helper')
const semverIncrement = require('semver-increment')
const globby = require('globby')
const R = require('rambdax')

module.exports = {
	description: 'Add a new Route (Minor) to both Core & Shell',
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
		const comVer = semverIncrement(
			[0, 1, 0],
			readComVer({type: 'routes', name: answers.name})
		).split('.')

		// Mutate Upstream to allow HandleBar convenience
		answers.verMajor = comVer[0]
		answers.verMinor = comVer[1]

		const actions = [
			// Route Specifics
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

			// Adjust Route Version
			answers =>
				bumpComVer({
					type: 'routes',
					name: answers.name
				})
		]

		const preComVer = readComVer({type: 'routes', name: answers.name})
		const external = comVer.join('.')
		const _selfPath = `${process.cwd()}/core/routes/${answers.name}/_self.js`
		const _self = R.path('versions.schemas._self', config)

		// _self adjustments / relinking to latest version of route
		actions.push({
			path: `${pathRoot}/core/routes/{{ kebabCase name }}/_self.js`,
			skipIfExists: true,
			templateFile: `${pathPlop}/core/route/_self.js`,
			type: `add`
		})

		if (
			!fileContains({
				filePath: _selfPath,
				text: `'${external}' /* toSelf */:`
			})
		) {
			actions.push({
				path: _selfPath,
				pattern: '/* PlopInjection:_self@to */',
				template: `'${external}' /* toSelf */: '${_self}',`,
				type: 'append'
			})
		}

		if (
			!fileContains({
				filePath: _selfPath,
				text: `version: '${_self}' /* toSelf */`
			})
		) {
			actions.push({
				path: _selfPath,
				pattern: '/* PlopInjection:_self@toTransformation */',
				template: `{version: '${_self}' /* toSelf */, mapping: async mapper => mapper},`,
				type: 'append'
			})
		}

		if (
			fileContains({
				filePath: _selfPath,
				text: `'${_self}' /* fromSelf */:`
			})
		) {
			actions.push({
				path: _selfPath,
				pattern: `'${_self}' /* fromSelf */: '${preComVer}'`,
				template: `'${_self}' /* fromSelf */: '${external}'`,
				type: 'modify'
			})
		} else {
			actions.push({
				path: _selfPath,
				pattern: '/* PlopInjection:_self@from */',
				template: `'${_self}' /* fromSelf */: '${external}',`,
				type: 'append'
			})
		}

		if (
			!fileContains({
				filePath: _selfPath,
				text: `version: '${external}' /* fromSelf */`
			})
		) {
			actions.push({
				path: _selfPath,
				pattern: '/* PlopInjection:_self@fromTransformation */',
				template: `{version: '${external}' /* fromSelf */, mapping: async mapper => mapper},`,
				type: 'append'
			})
		}

		// _self spec sync
		actions.push({
			path: `${pathRoot}/core/routes/{{ kebabCase name }}/_self.spec.js`,
			skipIfExists: true,
			templateFile: `${pathPlop}/core/route/_self.spec.js`,
			type: `add`
		})
		actions.push({
			path: `${pathRoot}/core/routes/{{ kebabCase name }}/_self.spec.js`,
			pattern: /PlopReplace:toSelf/g,
			template: `${_self}`,
			type: 'modify'
		})
		actions.push({
			path: `${pathRoot}/core/routes/{{ kebabCase name }}/_self.spec.js`,
			pattern: /PlopReplace:fromSelf/g,
			template: `${external}`,
			type: 'modify'
		})

		// Increment Version to latest in all existing Verbs
		globby.sync(`core/**/v${answers.verMajor}.js`).map(verb => {
			return actions.push({
				path: `${process.cwd()}/${verb}`,
				pattern: '/* PlopInjection:addVersion */',
				template: `pipelines['${external}'] = R.flatten(R.append([/* TODO */], pipelines['${preComVer}']))`,
				type: 'append'
			})
		})

		// Test Updates / Injections
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

		// Register route with Fastify
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
