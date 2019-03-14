const pathRoot = '../..'
const pathPlop = '..'

const R = require('rambdax')
const globby = require('globby')
const rfdc = require('rfdc')({proto: true})
const semverIncrement = require('semver-increment')
const {_toSelf} = require('./common')
const {fileContains, bumpComVer, readComVer} = require('../helper')

const existingRoutes = globby.sync('./**', {
	onlyDirectories: true,
	deep: 0,
	cwd: process.cwd() + '/core/routes'
})

module.exports = {
	description: 'Bump Route',
	prompts: [
		{
			type: 'list',
			name: 'name',
			message: 'Selecet Route? ( flat routes only at this time )',
			choices: existingRoutes
		},
		{
			type: 'list',
			name: 'bump',
			message: answers =>
				`Existing Version of ${answers.name}: ${R.path(
					`versions.routes.${answers.name}`,
					config
				)}\n  Select Version to Bump`,
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
			readComVer({type: 'routes', name: answers.name})
		).split('.')

		// Mutate Upstream to allow HandleBar convenience
		answers.verMajor = comVer[0]
		answers.verMinor = comVer[1]

		const actions = [
			// Adjust Route Version
			answers =>
				bumpComVer({
					type: 'routes',
					answers
				})
		]

		const preComVer = readComVer({type: 'routes', name: answers.name})

		actions.push(
			_toSelf({
				type: 'route',
				external: comVer.join('.'),
				preComVer,
				answers
			})
		)

		// Increment Version to latest in all existing Verbs
		if (answers.bump !== 'Minor') {
			// Lock existing routes to latest version
			actions.push({
				path: `${pathRoot}/shell/routes/{{ kebabCase name }}.js`,
				pattern: /`\$\{config.versions.routes.*\}`/g,
				template: `'${preComVer}'`,
				type: 'modify'
			})
			// Update All Route's Verbs in Shell
			globby
				.sync(`core/routes/${answers.name}`, {
					onlyDirectories: true,
					deep: 0
				})
				.forEach(verb => {
					actions.push({
						path: `${pathRoot}/shell/routes/{{ kebabCase name }}.js`,
						pattern: '/* PlopInjection:routeName */',
						templateFile: `${pathPlop}/shell/route-verison.hbs`,
						type: 'append',
						data: {verb: rfdc(verb.split('/').slice(-1)[0])}
					})
				})
		}

		// Schema Updates / Injections
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

		return R.flatten(actions)
	}
}
