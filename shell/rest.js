const R = require('rambdax')
const api = require('path').basename(__filename.replace('.js', ''))
const iface = require('^iface/rest')
const {pickVersion} = require('./common')

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

const readVersions = {}
/* PlopInjection:addReadVersion */

module.exports = {read: ({versions}) => pickVersion({versions, readVersions})}
