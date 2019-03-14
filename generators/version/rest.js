const pathRoot = '../..'
const pathPlop = '..'

const R = require('rambdax')
const globby = require('globby')
const semverIncrement = require('semver-increment')
const {_toSelf} = require('./common')
const {bumpComVer, readComVer} = require('../helper')

const existingRests = globby.sync('./**', {
	onlyDirectories: true,
	deep: 0,
	cwd: process.cwd() + '/core/rests'
})

module.exports = {
	description: 'Bump Route',
	prompts: [
		{
			type: 'list',
			name: 'name',
			message: 'Selecet external REST API? ( flat routes only at this time )',
			choices: existingRests
		},
		{
			type: 'list',
			name: 'bump',
			message: answers =>
				`Existing Version of ${answers.name}: ${readComVer({
					type: 'rests',
					name: answers.name
				})}\n  Select Version to Bump`,
			choices: ['Major', 'Minor']
		},
		{
			type: 'input',
			name: 'functionName',
			message: 'First Function Name to be used in Data Pipeline?',
			default: 'startPipe',
			when: answers => answers.bump === 'Major'
		}
	],
	actions: answers => {
		const comVer = semverIncrement(
			answers.bump === 'Major' ? [1, 0, 0] : [0, 1, 0],
			readComVer({type: 'rests', name: answers.name})
		).split('.')
		answers.version = comVer.join('.')

		// Mutate Upstream to allow HandleBar convenience
		answers.verMajor = comVer[0]
		answers.verMinor = comVer[1]

		const verbs = ['Read', 'Upsert']

		const actions = [
			// Adjust Route Version
			answers =>
				bumpComVer({
					type: 'rests',
					answers
				})
		]

		actions.push(
			_toSelf({
				type: 'rest',
				external: comVer.join('.'),
				preComVer: readComVer({type: 'rests', name: answers.name}),
				answers
			})
		)
		// Increment Version to latest in all existing Verbs
		verbs.forEach(verb => {
			actions.push({
				path: `${pathRoot}/shell/rests/{{ kebabCase name }}.js`,
				pattern: `/* PlopInjection:add${verb}Version */`,
				templateFile: `${pathPlop}/shell/rest-version.hbs`,
				type: 'append'
			})
		})

		const debug = require('debug')('_inject')
		debug(actions)
		return R.flatten(actions)
	}
}
