require('resquire')

const root = '../..'
const plop = '..'
const {fileContains, bumpComVer} = require('../helper')
const R = require('rambdax')
const globby = require('globby')

const schemaLatest = R.path('version', require('^iface/_self')())

// Regex for all _self files and then inject into them

module.exports = {
	description: 'Bump _Self (Applies everywhere its used)',
	prompts: [
		{
			type: 'list',
			name: 'name',
			message: `Existing Schema Version: ${schemaLatest}\n  Select Version to Bump`,
			choices: ['Major', 'Minor']
		}
	],
	actions: answers => {
		const newVersion = require('semver-increment')(
			answers.name === 'Major' ? [1, 0, 0] : [0, 1, 0],
			schemaLatest
		)
		const actions = []

		// Data Model for _self
		if (
			!fileContains({
				filePath: `${process.cwd()}/iface/_self.js`,
				text: `'${newVersion}': {`
			})
		) {
			actions.push({
				path: `${root}/iface/_self.js`,
				pattern: '/* PlopInjection:_self */',
				template: `_selfVersions['${newVersion}'] = {}`,
				type: 'append'
			})
		}

		// ETL's for Routes / Endpoints / Interfaces
		globby.sync('core/**/_self.js').map(_self => {
			const debug = require('debug')('_self')

			const _selfPath = `${process.cwd()}/${_self}`
			const configPath = R.takeLast(3, _selfPath.split('/'))
				.join('.')
				.slice(0, -9)
			const external = R.path(`versions.${configPath}`, config)
			debug(_selfPath, configPath, external, schemaLatest)

			// _self adjustments / relinking to latest version of route
			if (
				fileContains({
					filePath: _selfPath,
					text: `'${external}' /* toSelf */: '${schemaLatest}'`
				})
			) {
				actions.push({
					path: _selfPath,
					pattern: `'${external}' /* toSelf */: '${schemaLatest}'`,
					template: `'${external}' /* toSelf */: '${newVersion}'`,
					type: 'modify'
				})
			} else {
				actions.push({
					path: _selfPath,
					pattern: '/* PlopInjection:_self@to */',
					template: `'${external}' /* toSelf */: '${newVersion}',`,
					type: 'append'
				})
			}

			if (
				!fileContains({
					filePath: _selfPath,
					text: `version: '${newVersion}' /* toSelf */`
				})
			) {
				actions.push({
					path: _selfPath,
					pattern: '/* PlopInjection:_self@toTransformation */',
					template: `{version: '${newVersion}' /* toSelf */, mapping: async mapper => mapper},`,
					type: 'append'
				})
			}

			if (
				!fileContains({
					filePath: _selfPath,
					text: `'${newVersion}' /* fromSelf */:`
				})
			) {
				actions.push({
					path: _selfPath,
					pattern: '/* PlopInjection:_self@from */',
					template: `'${newVersion}' /* fromSelf */: '${external}',`,
					type: 'append'
				})
			}

			return true
		})

		// Increment Config Version
		actions.push(() =>
			bumpComVer({
				type: 'schemas',
				name: '_self'
			})
		)
		return actions
	}
}
