const fs = require('fs')

module.exports = {fileContains}

function fileContains({filePath, text}) {
	if (fs.existsSync(filePath)) {
		const fileData = fs.readFileSync(filePath, {encoding: 'utf-8'})
		const dataArray = fileData.split('\n')
		const searchKeyword = text

		for (let index = 0; index < dataArray.length; index++) {
			if (dataArray[index].includes(searchKeyword)) {
				return true
			}
		}

		return false
	}
}
