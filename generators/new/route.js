const root = '../..'
const plop = '..'
const fs = require('fs')

function fileContains({filePath, text}) {
	if (fs.existsSync(filePath)) {
		const fileData = fs.readFileSync(filePath, {encoding: 'utf-8'})
		const dataArray = fileData.split('\n')
		const searchKeyword = text

		for (let index = 0; index < dataArray.length; index++) {
			if (dataArray[index].includes(searchKeyword)) {
				return true
			}
		}

		return false
	}
}

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
			name: 'verMajor',
			message: 'Initial Major Version to be used? (SemVer standard)'
		},
		{
			type: 'input',
			name: 'verMinor',
			message: 'Initial Minor Version to be used? (SemVer standard)'
		}
	],
	actions: data => {
		const actions = [
			{
				path: `${root}/core/routes/{{ kebabCase name }}/{{ kebabCase verb }}/index.js`,
				skipIfExists: true,
				templateFile: `${plop}/core/route/index.js`,
				type: `add`
			},
			{
				path: `${root}/core/routes/{{ kebabCase name }}/{{ kebabCase verb }}/v{{ verMajor }}.js`,
				skipIfExists: true,
				templateFile: `${plop}/core/route/v.js`,
				type: `add`
			},
			{
				path: `${root}/core/routes/{{ kebabCase name }}/{{ kebabCase verb }}/v{{ verMajor }}.spec.js`,
				skipIfExists: true,
				templateFile: `${plop}/core/route/v.spec.js`,
				type: `add`
			},
			{
				path: `${root}/shell/routes/{{ kebabCase name }}.js`,
				skipIfExists: true,
				templateFile: `${plop}/shell/route.js`,
				type: `add`
			},
			{
				path: `${root}/shell/routes/{{ kebabCase name }}.js`,
				pattern: '/* PlopInjection:routeName */',
				templateFile: `${plop}/shell/route-verison.hbs`,
				type: 'append'
			},
			{
				path: `${root}/shell/routes/{{ kebabCase name }}.schema.js`,
				skipIfExists: true,
				templateFile: `${plop}/shell/route.schema.js`,
				type: `add`
			}
		]

		if (
			!fileContains({
				filePath: `${process.cwd()}/shell/routes/${data.name}.schema.js`,
				text: `${data.verMajor}.${data.verMinor}`
			})
		) {
			actions.push({
				path: `${root}/shell/routes/{{ kebabCase name }}.schema.js`,
				pattern: '/* PlopInjection:addVersion */',
				templateFile: `${plop}/shell/schema-version.hbs`,
				type: 'append'
			})
		}

		if (
			!fileContains({
				filePath: `${process.cwd()}/index.js`,
				text: `^shell/routes/${data.name.toLowerCase()}`
			})
		) {
			actions.push({
				path: `${root}/index.js`,
				pattern: '/* PlopInjection:routeName */',
				template: ".register(require('^shell/routes/{{ lowerCase name }}'))",
				type: 'append'
			})
		}

		return actions
	}
}
