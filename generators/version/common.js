const R = require('rambdax')
const globby = require('globby')
const pluralize = require('pluralize')
const {fileContains, bumpComVer} = require('../helper')

function _toSelf({type, external, preComVer, answers}) {
	const types = pluralize.plural(type)
	const _selfPath = `${process.cwd()}/core/${types}/${answers.name}/_self.js`
	const _self = R.path('versions.schemas._self', config)

	const actions = []
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

	if (answers.bump === 'Minor') {
		globby
			.sync(`core/${types}/${answers.name}/**/v${answers.verMajor}.js`)
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
			.sync(`core/${types}/${answers.name}/**`, {
				onlyDirectories: true,
				deep: 0
			})
			.map(endpoint => {
				actions.push({
					path: `${process.cwd()}/${endpoint}/v{{ verMajor }}.js`,
					skipIfExists: true,
					templateFile: `plop/core/${type}/v.js`,
					type: `add`
				})
				actions.push({
					path: `${process.cwd()}/${endpoint}/v{{ verMajor }}.spec.js`,
					skipIfExists: true,
					templateFile: `plop/core/${type}/v.spec.js`,
					type: `add`
				})
				return actions.push({
					path: `${process.cwd()}/${endpoint}/index.js`,
					pattern: '/* PlopInjection:addVersion */',
					template: `pipelines.v{{ verMajor }} = require('./v{{ verMajor }}')`,
					type: 'append'
				})
			})
	}

	return actions
}

module.exports = {_toSelf}
