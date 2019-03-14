const fs = require('fs-extra')
const {camelCase} = require('change-case')
const pluralize = require('pluralize')
const R = require('rambdax')
const debug = require('debug')('_self')

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

	return false
}

function changeJson({path, answers, type, keyPath, value, bump = {}}) {
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

	let mergeData
	let existingVersion = R.pathOr('0.0.0', keyPath, json)
	if (R.isType('Object', existingVersion))
		existingVersion = latestComVerKey({versions: existingVersion})

	switch (type) {
		case 'rests':
			mergeData = R.change({}, `versions.${type}.${answers.name}`, {})
			mergeData.versions[type][answers.name][
				semverIncrement(bumpType, existingVersion)
			] = {
				baseURL: answers.baseURL
			}
			debug(mergeData)
			json = R.mergeDeep(json, mergeData)
			break
		case 'routes':
		case 'schemas':
			json = R.change(json, keyPath, semverIncrement(bumpType, existingVersion))
			break
		default:
	}

	debug(json)

	fs.writeJsonSync(path, bumpType ? json : R.change(json, keyPath, value))

	return `JSON @${path} updated and written!`
}

function latestComVerKey({versions} = {}) {
	return versions
		? R.last(R.keys(versions).sort(require('semver-compare')))
		: '0.0.0'
}

function readComVer({type = 'routes', name}) {
	debug(config)
	const versionsPath = `versions.${camelCase(pluralize(type))}.${camelCase(
		name
	)}`
	const readJSON = fs.readJsonSync(`${process.cwd()}/config/default.json`)
	debug(versionsPath, R.path(versionsPath, readJSON))

	switch (type) {
		case 'rests':
			return latestComVerKey({
				versions: R.pathOr({'0.0.0': {}}, versionsPath, readJSON)
			})
		case 'routes':
			return R.pathOr('0.0.0', versionsPath, readJSON)
		default:
	}
}

function bumpComVer({type = 'routes', answers}) {
	const bump = R.pathOr('minor', 'bump', answers).toLowerCase()
	const {name} = answers
	return changeJson({
		answers,
		path: `${process.cwd()}/config/default.json`,
		keyPath: `versions.${camelCase(pluralize(type))}.${
			name === '_self' ? name : camelCase(name)
		}`,
		bump,
		type
	})
}
