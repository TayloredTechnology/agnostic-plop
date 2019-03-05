const pathRoot = '../..'
const pathPlop = '..'
const {fileContains, bumpComVer, readComVer} = require('../helper')
const semverIncrement = require('semver-increment')
const globby = require('globby')
const R = require('rambdax')
const rfdc = require('rfdc')({proto: true})

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
					name: answers.name,
					bump: answers.bump
				})
		]

		const preComVer = readComVer({type: 'routes', name: answers.name})
		const external = comVer.join('.')
		const _selfPath = `${process.cwd()}/core/routes/${answers.name}/_self.js`
		const _self = R.path('versions.schemas._self', config)

		// _self adjustments / relinking to latest version of route
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

		// Increment Version to latest in all existing Verbs
		if (answers.bump === 'Minor') {
			globby
				.sync(`core/routes/${answers.name}/**/v${answers.verMajor}.js`)
				.map(verb => {
					return actions.push({
						path: `${process.cwd()}/${verb}`,
						pattern: '/* PlopInjection:addVersion */',
						template: `pipelines['${external}'] = R.flatten(R.append([/* TODO */], pipelines['${preComVer}']))`,
						type: 'append'
					})
				})
		} else {
			globby
				.sync(`core/routes/${answers.name}/**`, {
					onlyDirectories: true,
					deep: 0
				})
				.map(route => {
					actions.push({
						path: `${process.cwd()}/${route}/v{{ verMajor }}.js`,
						skipIfExists: true,
						templateFile: `${pathPlop}/core/route/v.js`,
						type: `add`
					})
					actions.push({
						path: `${process.cwd()}/${route}/v{{ verMajor }}.spec.js`,
						skipIfExists: true,
						templateFile: `${pathPlop}/core/route/v.spec.js`,
						type: `add`
					})
					return actions.push({
						path: `${process.cwd()}/${route}/index.js`,
						pattern: '/* PlopInjection:addVersion */',
						template: `pipelines.v{{ verMajor }} = require('./v{{ verMajor }}')`,
						type: 'append'
					})
				})
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

		return actions
	}
}
