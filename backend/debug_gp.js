const gp = require("@ngageoint/geopackage");
console.log("GeoPackage keys:", Object.keys(gp.GeoPackage));
console.log("FeatureDao prototype:", Object.keys(gp.FeatureDao ? gp.FeatureDao.prototype : {}));
