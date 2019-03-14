/* eslint unicorn/regex-shorthand: 0 */
const R = require('rambdax')
const core = require('^core/index')
const rfdc = require('rfdc')({proto: true})

const debugPath = 'core:route/{{ kebabCase name }}/{{ kebabCase verb }}'

// Pipeline Definition / Import
const pipelines = {}
pipelines.v{{ verMajor }} = require('./v{{ verMajor }}')
/* PlopInjection:addVersion */

/*
 * NOTE: within pipelines its critical to rfdc at incoming data points to avoid
 * mutating incomming data the only exception should be `request` & `response` as
 * fastify needs to maintain owneship over the original objects
 * Suggest dropping the `_` when inside the function to identify the rfdc
 */

function _init({request, _cache = {}, _out = {}, ..._passthrough}) {
	const debug = require('debug')(`${debugPath}@_init`)
	// RFDC @ entrypoint all mutated objects to prevent parent node mutation
	let cache = rfdc(_cache)
	let out = rfdc(_out)

	// Init code shared through version
	cache = R.change(cache, 'session', rfdc(R.pathOr({}, 'session', request)))

	return {
		request,
		_out: out,
		_cache: cache,
		..._passthrough
	}
}

function _end({request, _out, _cache}) {
	const debug = require('debug')(`${debugPath}@_end`)
	// Session Logic Hooks require the `Request` object to be updated directly
	request.session = rfdc(_cache.session)
	return rfdc(_out)
}

/* istanbul ignore next */
module.exports = data => {
	const {request, versions} = data
	const pipeline = R.flatten([
		_init,
		require('^core/select-pipeline')({request, pipelines, versions}),
		_end
	])
	return core
		.pPipe(...pipeline)(data)
		.catch(core.remotelog('error'))
}
