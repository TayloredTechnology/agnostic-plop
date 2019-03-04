const createMapper = require('map-factory')
const {_selfHelp, schema} = require('^iface/_self')

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

// TODO make stamp
module.exports = {
	toSelf: /* istanbul ignore next */ params =>
		_selfHelp.result({...params, direction: toSelf}),
	fromSelf: /* istanbul ignore next */ params =>
		_selfHelp.result({...params, direction: fromSelf}),
	schema,
	latest: {
		self: /* istanbul ignore next */ params =>
			_selfHelp.highestCompatible({...params, direction: toSelf}),
		external: /* istanbul ignore next */ params =>
			_selfHelp.highestCompatible({...params, direction: fromSelf})
	}
}
