const fs = require('fs')
const {camelCase} = require('change-case')
const pluralize = require('pluralize')

module.exports = {fileContains, changeJson, bumpComVer, readComVer}

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

function changeJson({path, keyPath, value, bump = {}}) {
	const fs = require('fs-extra')
	const R = require('rambdax')
	const semverIncrement = require('semver-increment')

	let json = fs.readJsonSync(path)
	let bumpType

	switch (bump) {
		case 'minor':
			bumpType = [0, 1, 0]
			break
		case 'major':
			bumpType = [1, 0, 0]
			break
		default:
	}

	json = R.change(
		json,
		keyPath,
		semverIncrement(bumpType, R.pathOr('0.0.0', keyPath, json))
	)
	fs.writeJsonSync(path, bumpType ? json : R.change(json, keyPath, value))

	return `JSON @${path} updated and written!`
}

function readComVer({type = 'routes', name}) {
	const fs = require('fs-extra')
	const R = require('rambdax')
	return R.pathOr(
		'0.0.0',
		`versions.${camelCase(pluralize(type))}.${camelCase(name)}`,
		fs.readJsonSync(`${process.cwd()}/config/default.json`)
	)
}

function bumpComVer({type = 'routes', name}) {
	return changeJson({
		path: `${process.cwd()}/config/default.json`,
		keyPath: `versions.${camelCase(pluralize(type))}.${
			name === '_self' ? name : camelCase(name)
		}`,
		bump: 'minor'
	})
}
