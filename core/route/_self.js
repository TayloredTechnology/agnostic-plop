const createMapper = require('map-factory')
const R = require('rambdax')
const compareVersions = require('semver-compare')

/* NOTE: this module's architecture is designed with the assumption that ComVer is
 * followed throughout. As such, pipelines are possible where `minor` versions would
 * add data values and not remove them.
 *
 * Breaking changes `major` result in the creation of a new pipeline by necessity
 */

// Convert external (from _self perspective) into _self data structure / schema
// Convert from _self into external (from _self perspective) data structure / schema
const toSelf = {
	bridgeMapping: {
		/* PlopInjection:_self@to */
	},
	// Transformation must be stored in descending order
	transformations: [
		/* PlopInjection:_self@toTransformation */
	]
}

const fromSelf = {
	bridgeMapping: {
		/* PlopInjection:_self@from */
	},
	transformations: [
		/* PlopInjection:_self@fromTransformation */
	]
}

function versionList({version = null, direction} = {version: null}) {
	const trans = R.path('transformations', direction)
	const index = R.findIndex(transform => {
		return compareVersions(transform.version, version) <= 0
	}, trans)
	return index >= 0 ? trans.slice(index) : trans
}

function highestCompatible({direction, version}) {
	const sortedBridges = R.keys(direction.bridgeMapping).sort(compareVersions)
	const bridgeVersion = (version
		? R.find(bridge => compareVersions(bridge, version) <= 0, sortedBridges)
		: sortedBridges.slice(-1))[0]
	return direction.bridgeMapping[bridgeVersion]
}

async function result({version, data, direction}) {
	toFrom = direction.toLowerCase() === 'toself' ? toSelf : fromSelf
	const mapper = createMapper()
	const compatibleVersion = highestCompatible({direction: toFrom, version})
	R.map(
		versionMap => versionMap.mapping(mapper),
		versionList({version: compatibleVersion, direction: toFrom})
	)
	return mapper.executeAsync(data)
}

// TODO make stamp

module.exports = {
	result,
	latest: {
		self: highestCompatible({direction: toSelf}),
		external: highestCompatible({direction: fromSelf})
	}
}
