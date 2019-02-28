require('resquire')

const R = require('rambdax')
const faker = require('faker')
const rfdc = require('rfdc')({proto: true})
const {describe, verifyDataMutation} = require('^iface/tap')(__filename)

const testPath = 'core:route/{{ kebabCase name }}/{{ kebabCase verb }}'
const rewire = require('rewire')(__filename.replace('.spec', ''))

// Assertions
const {equal} = require('muggle-assert')

// Tests fork and run in parallel, keep this in mind as pipelines are typically sequential
// Expected entry data start when pipeline commences. Added as a common starting point for all tests
const entryData = {
	_cache: {},
	_out: {},
	request: {
		session: {
			user_id: faker.random.number()
		}
	},
	reply: {}
}

describe(`${testPath}@_init:fallthrough`, async () => {
	const data = R.change(entryData, 'request.session', undefined)
	delete data._cache
	delete data._out
	await verifyDataMutation({
		_function: '_init',
		data,
		rewire,
		patches: [
			{
				patch: {op: 'add', path: '/_out', value: {}},
				msg: '_out defaulted'
			},
			{
				patch: {op: 'add', path: '/_cache', value: {session: {}}},
				msg: 'default session added to _cache'
			}
		]
	})
})

describe(`${testPath}@_init`, async () => {
	const data = rfdc(entryData)
	const {dataReturn} = await verifyDataMutation({
		_function: '_init',
		data,
		rewire,
		patches: [
			{
				patch: {
					op: 'add',
					path: '/_cache/session',
					value: {
						user_id: R.path('request.session.user_id', data)
					}
				},
				msg: '_cache object contains correct session'
			}
		]
	})
})

describe(`${testPath}@_end`, async () => {
	const debug = require('debug')('verifyDataMutation')
	const data = rfdc(entryData)
	debug(data)
	const {dataReturn} = await verifyDataMutation({
		_function: '_end',
		data,
		rewire,
		patches: [
			{patch: {op: 'remove', path: '/_cache'}, msg: '_cache dropped'},
			{patch: {op: 'remove', path: '/_out'}, msg: '_out dropped'},
			{patch: {op: 'remove', path: '/request'}, msg: 'request dropped'},
			{patch: {op: 'remove', path: '/reply'}, msg: 'reply dropped'}
		]
	})
	// Validate business logic / data manipulation by walking the patch
	equal(data._out, dataReturn, '_out mapped to returned data of _end')
})
