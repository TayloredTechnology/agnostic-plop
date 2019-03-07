const R = require('rambdax')
const api = require('path').basename(__filename.replace('.js', ''))
const iface = require('^iface/rest')

const debugPath = 'shell:rest/{{ name }}'
/*
 * .read accepts: [], [{pipeName: []}], {pipeName}
 * pipeName accepts: [], [{type: 'pick|filter', filter: 'root path', isArray: boolean}]
 *
 * As many pipes as needed can be assigned, as all pipes are generated during same internal tick
 * and will emit data only when available for consumption.
 *
 * 'raw' is the direct pipe stream in JSON format, produced as available in valid objects. Expect several events per stream
 */

// Core Algorithm Require
/* PlopReplace:read */
/* PlopReplace:upsert */

async function read({version} = {}) {
	const debug = require('debug')(`${debugPath}@read`)
	const stream = await iface({api})
		.url(/* Replace With URL Path to read*/)
		.read([{aNamedForkOfPipe: [{type: 'pick', filter: 'list', isArray: true}]}])

	// Streams should be sent to the respective core / shell for processing
	stream.on('aNamedForkOfPipe', data => core.read({data}))
	stream.on('raw', data => debug(data))

	// NOTE: Stream may not end, while results of external api are streamed, the API itself may not respect the stream and fail to issue the close() notification
	stream.on('end', () =>
		console.log(`${api}@${version ? version : 'latest'}:READ completed`)
	)
}

module.exports = {read}
