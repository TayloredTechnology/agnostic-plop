const pathPlop = '..'
const pathRoot = '../..'

const R = require('rambdax')
const common = require('./common')
const semverIncrement = require('semver-increment')
const {bumpComVer, readComVer} = require('../helper')

module.exports = {
	description: 'Add an External REST API',
	prompts: [
		{
			type: 'input',
			name: 'name',
			message: 'REST API Name?'
		},
		{
			type: 'input',
			name: 'version',
			message: 'Starting API Version? (SemVer)',
			default: '0.1.0',
			validate: input => require('is-semver')(input)
		},
		{
			type: 'input',
			name: 'baseURL',
			message: 'base URL for REST API?',
			default: 'https://api.openweathermap.org'
		},
		{
			type: 'input',
			name: 'functionName',
			message:
				'First Function Name to be used in Data Pipeline? (will be camelCased)',
			default: 'startPipe'
		}
	],
	actions: answers => {
		const comVer = semverIncrement(
			[0, 1, 0],
			readComVer({type: 'rests', name: answers.name})
		).split('.')

		// Mutate Upstream to allow HandleBar convenience
		answers.verMajor = comVer[0]
		answers.verMinor = comVer[1]

		const actions = []
		const verbs = ['read', 'upsert']

		verbs.forEach(verb => {
			// Core Specifics
			actions.push([
				{
					path: `${pathRoot}/core/rests/{{ kebabCase name }}/${verb}/index.js`,
					skipIfExists: false, // Abort as REST API should only be init once
					templateFile: `${pathPlop}/core/rest/index.js`,
					type: `add`
				},
				{
					path: `${pathRoot}/core/rests/{{ kebabCase name }}/${verb}/index.spec.js`,
					skipIfExists: true,
					templateFile: `${pathPlop}/core/rest/index.spec.js`,
					type: `add`
				},
				{
					path: `${pathRoot}/core/rests/{{ kebabCase name }}/${verb}/v{{ verMajor }}.js`,
					skipIfExists: true,
					templateFile: `${pathPlop}/core/rest/v.js`,
					type: `add`
				},
				{
					path: `${pathRoot}/core/rests/{{ kebabCase name }}/${verb}/v{{ verMajor }}.spec.js`,
					skipIfExists: true,
					templateFile: `${pathPlop}/core/rest/v.spec.js`,
					type: `add`
				},
				// Shell Specifics
				{
					path: `${pathRoot}/shell/rests/{{ kebabCase name }}.js`,
					skipIfExists: true,
					templateFile: `${pathPlop}/shell/rest.js`,
					type: `add`
				},
				// Adjust Route Version
				answers =>
					bumpComVer({
						type: 'rests',
						answers
					})
			])
		})

		verbs.forEach(verb => {
			actions.push({
				path: `${pathRoot}/shell/rests/{{ kebabCase name }}.js`,
				pattern: `/* PlopReplace:${verb} */`,
				template: `core.${verb} = require('^core/rests/{{ kebabCase name }}/${verb}/index')`,
				type: 'modify'
			})
		})

		actions.push(
			common._toSelf({
				type: 'rest',
				external: comVer.join('.'),
				preComVer: readComVer({type: 'rests', name: answers.name}),
				answers
			})
		)

		return R.flatten(actions)
	}
}
