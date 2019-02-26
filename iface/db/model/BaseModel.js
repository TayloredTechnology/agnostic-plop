/* eslint unicorn/filename-case: 0 */
/* eslint new-cap: 0 */

const {Model} = require('objection')
const {DbErrors} = require('objection-db-errors')

class BaseModel extends DbErrors(Model) {}

module.exports = {Model: BaseModel}
