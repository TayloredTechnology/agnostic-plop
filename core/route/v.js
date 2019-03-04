/* eslint unicorn/regex-shorthand: 0 */

const R = require('rambdax')
const got = require('got')
const result = require('await-result')
const url = require('url-parse')
const config = require('config')
const rfdc = require('rfdc')({proto: true})

const debugPath = 'core:route/{{ kebabCase name }}/{{ kebabCase verb }}'

/*
 * NOTE: _self is the translation between the MicroService internal business logic data model and external interfaces. When it should be used, format and validation vary depending on the endpoint
 */
const _self = require('../_self')

const pipelines = {}
pipelines['{{ verMajor }}.{{ verMinor }}.0'] = [{{ camelCase functionName }}]

async function {{ camelCase functionName }}({
	..._passthrough
}) {
	return {
		..._passthrough
	}
}

module.exports = pipelines
