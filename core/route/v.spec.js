require('resquire')

const R = require('rambdax')
const faker = require('faker')
const rfdc = require('rfdc')({proto: true})
const {describe, verifyDataMutation} = require('^iface/tap')(__filename)
const {get} = require('deeps')

const testPath = 'core:route/{{ kebabCase name }}/{{ kebabCase verb }}'
const rewire = require('rewire')(__filename.replace('.spec', ''))

// Assertions
const {equal} = require('muggle-assert')

// Tests fork and run in parallel, keep this in mind as pipelines are typically sequential
// Expected entry data start when pipeline commences. Added as a common starting point for all tests
const entryData = {
	_cache: {},
	_out: {},
	request: {},
	reply: {}
}

describe(`${testPath}@{{ camelCase functionName }}:fallthrough`, async () => {
	const data = R.change(entryData, 'request.session', undefined)
	delete data._cache
	delete data._out
	await verifyDataMutation({
		_function: '{{ camelCase functionName }}',
		data,
		rewire,
		patches: [
			{
				patch: {},
				msg: 'initial test'
			}
		]
	})
})

describe(`${testPath}@{{ camelCase functionName }}`, async () => {
	const data = rfdc(entryData)
	const {dataReturn} = await verifyDataMutation({
		_function: '{{ camelCase functionName }}',
		data,
		rewire,
		patches: [
			{
				patch: {},
				msg: 'initial test'
			}
		]
	})
	// Example how additional tests can be completed verifyDataMutation returns
	// dataReturn, and extractedFunction for any additional process necessary
	// equal(data._out, dataReturn, '_out mapped to returned data of _end')
})
