const R = require('rambdax')
const faker = require('faker')
const rfdc = require('rfdc')({proto: true})
const {describe, td} = require(`${process.cwd()}/iface/tap`)(__filename)

// Mocks @ Data Layer Only
const fs = td.replace('fs-extra')

const testPath = 'plop:generators:helper'
const rewire = require('rewire')(__filename.replace('.spec', ''))

// Assertions
const {equal} = require('muggle-assert')

// Tests fork and run in parallel, keep this in mind as pipelines are typically sequential
// Expected entry data start when pipeline commences. Added as a common starting point for all tests
const entryData = {}
global.config = {
	versions: {
		rests: {dummyApi: {'1.5.0': {baseURL: 'https://dummy.api'}}},
		routes: {dummyRoute: '0.2.0'},
		schemas: {_self: '0.1.0'}
	}
}
td.when(fs.readJsonSync(td.matchers.anything())).thenReturn(config)

const latestComVerKey = rewire.__get__('latestComVerKey')
describe(`${testPath}@latestComVerKey`, async () => {
	// Const debug = require('debug')(`${testPath}@readComVer:routes`)
	equal(
		latestComVerKey({versions: null}),
		'0.0.0',
		'no version value returns default 0.0.0 version'
	)
	equal(latestComVerKey(), '0.0.0', 'no object returns default 0.0.0 version')
	equal(
		latestComVerKey({versions: config.versions.rests.dummyApi}),
		'1.5.0',
		'one version object returns correctly'
	)
	equal(
		latestComVerKey({
			versions: R.mergeDeep({'2.0.0': {}}, config.versions.rests.dummyApi)
		}),
		'2.0.0',
		'multiple version objects returns correctly'
	)
})

const readComVer = rewire.__get__('readComVer')
describe(`${testPath}@readComVer:routes`, async () => {
	// Const debug = require('debug')(`${testPath}@readComVer:routes`)
	equal(
		readComVer({type: 'routes', name: 'dummyRoute'}),
		'0.2.0',
		'route validates version correctly'
	)
	equal(
		readComVer({type: 'routes'}),
		'0.0.0',
		'route returns "default value" without name'
	)
})

describe(`${testPath}@readComVer:rests`, async () => {
	// Const debug = require('debug')(`${testPath}@readComVer:routes`)
	equal(
		readComVer({type: 'rests', name: 'dummyApi'}),
		'1.5.0',
		'rests validates version correctly'
	)
	equal(
		readComVer({type: 'rests'}),
		'0.0.0',
		'route returns "default value" without name'
	)
})
