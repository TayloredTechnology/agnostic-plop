const compareVersions = require('semver-compare')

function pickVersion({versions, collection}) {
	// Versions is the shared compatibility tracker for all internal and external endpoints
	const version = R.path(`rests.${api}`, versions)
	const collectionVersions = R.keys(collection).sort(compareVersions)

	// Map to latest compatibility automatically without supplied version
	let retVer = R.last(collectionVersions)
	if (!version) return collection[retVer]

	for (var i = 0, len = collectionVersions.length; i < len; i++) {
		const verKey = collectionVersions[i]
		if (compareVersions(verKey, version) === 1) break
		retVer = verKey
	}

	return collection[retVer]
}

module.exports = {pickVersion}
