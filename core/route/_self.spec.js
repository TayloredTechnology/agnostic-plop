require('resquire')

const R = require('rambdax')
const faker = require('faker')
const rfdc = require('rfdc')({proto: true})
const {describe} = require('^iface/tap')(__filename)

const testPath = 'core:route/itstarts/_self'
const rewire = require('rewire')(__filename.replace('.spec', ''))

// Assertions
const {equal} = require('muggle-assert')

// Tests fork and run in parallel, keep this in mind as pipelines are typically sequential
// Expected entry data start when pipeline commences. Added as a common starting point for all tests
const entryData = {}
const toSelf = rewire.__get__('toSelf.transformations')
const fromSelf = rewire.__get__('fromSelf.transformations')

async function mapped({data, _self, version}) {
	const {mapping} = R.find(t => t.version === version, _self)
	const createMapper = require('map-factory')
	const mapper = createMapper()
	mapping(mapper)
	return mapper.executeAsync(data)
}

/*
 * toSelf
 */

// JSON Patch chosen not to be used in these tests in favour of equal(deep) as these are(should be)direct mappings
describe(`${testPath}@toSelf:PlopReplace:toSelf`, async () => {
	const out = await mapped({
		data: entryData,
		_self: toSelf,
		version: 'PlopReplace:toSelf'
	})

	equal(out, {}, 'transformation sucessful')
})

/*
 * fromSelf
 */

describe(`${testPath}@fromSelf:PlopReplace:fromSelf`, async () => {
	const out = await mapped({
		data: entryData,
		_self: fromSelf,
		version: 'PlopReplace:fromSelf'
	})

	equal(out, {}, 'transformation sucessful')
})
