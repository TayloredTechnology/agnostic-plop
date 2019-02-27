/* eslint unicorn/regex-shorthand: 0 */

const R = require('rambdax')
const deeps = require('deeps')
const got = require('got')
const result = require('await-result')
const url = require('url-parse')
const config = require('config')
const rfdc = require('rfdc')({proto: true})

const debugPath = 'core:route/{{ kebabCase name }}/{{ kebabCase verb }}'

const pipelines = {}
pipelines['{{ verMajor }}.{{ verMinor }}.0'] = [{{ camelCase functionName }}]
//pipelines['{{ verMajor }}.{{ verMinor }}.0'] = R.flatten(R.append([persistCartWithUser], pipelines['{{ verMajor }}.{{ verMinor }}.0']))

async function {{ camelCase functionName }}({
	..._passthrough
}) {
	return {
		..._passthrough
	}
}

module.exports = pipelines
