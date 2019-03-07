const pluralize = require('pluralize')
const {fileContains, bumpComVer} = require('../helper')
const R = require('rambdax')

function _toSelf({
	pathRoot = '../..',
	pathPlop = '..',
	type,
	external,
	preComVer,
	answers
}) {
	const types = pluralize.plural(type)
	const _selfPath = `${process.cwd()}/core/${types}/${answers.name}/_self.js`
	const _self = R.path('versions.schemas._self', config)

	const actions = [
		// _self spec sync
		{
			path: `${pathRoot}/core/${types}/{{ kebabCase name }}/_self.spec.js`,
			skipIfExists: true,
			templateFile: `${pathPlop}/core/${type}/_self.spec.js`,
			type: `add`
		},
		{
			path: `${pathRoot}/core/${types}/{{ kebabCase name }}/_self.spec.js`,
			pattern: /PlopReplace:toSelf/g,
			template: `${_self}`,
			type: 'modify'
		},
		{
			path: `${pathRoot}/core/${types}/{{ kebabCase name }}/_self.spec.js`,
			pattern: /PlopReplace:fromSelf/g,
			template: `${external}`,
			type: 'modify'
		}
	]

	// _self adjustments / relinking to latest version
	actions.push({
		path: `${pathRoot}/core/${types}/{{ kebabCase name }}/_self.js`,
		skipIfExists: true,
		templateFile: `${pathPlop}/core/${type}/_self.js`,
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

	// Increment Version to latest in all existing Verbs
	require('globby')
		.sync(`core/rests/${answers.name}/**/v${answers.verMajor}.js`)
		.map(verb => {
			return actions.push({
				path: `${process.cwd()}/${verb}`,
				pattern: '/* PlopInjection:addVersion */',
				template: `pipelines['${external}'] = R.flatten(R.append([/* TODO */], pipelines['${preComVer}']))`,
				type: 'append'
			})
		})

	return actions
}

module.exports = {_toSelf}
