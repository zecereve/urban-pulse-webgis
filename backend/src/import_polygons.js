const { MongoClient } = require("mongodb");
const path = require("path");
const fs = require("fs");

const MONGO_URI =
    "mongodb+srv://ceremvermez_db_user:0611@cluster0.rsymqpq.mongodb.net/urban_pulse?retryWrites=true&w=majority&appName=Cluster0";
const DB_NAME = "urban_pulse";
const DATA_DIR = path.join(__dirname, "../data");

// Türkçe karakterleri ve büyük/küçük harfi normalize etme
function normalizeName(name) {
    if (!name) return "";
    // Remove replacement characters matches FIRST
    let n = String(name).replace(/\ufffd/g, "").trim();

    // Manual fixes for bad encoding
    // This is necessary because shpjs might misinterpret Windows-1254 as UTF-8
    const manualMap = {
        "ereflikohisar": "Şereflikoçhisar",
        "Keiren": "Keçiören",
        "ankaya": "Çankaya",
        "Glba": "Gölbaşı",
        "Aya": "Ayaş",
        "Beypazar": "Beypazarı",
        "amldere": "Çamlıdere",
        "ubuk": "Çubuk",
        "Elmada": "Elmadağ",
        "Gdl": "Güdül",
        "Kzlcahamam": "Kızılcahamam",
        "Nallhan": "Nallıhan",
        "Altnda": "Altındağ",
        "Polatl": "Polatlı",
        "Bala": "Balâ"
    };

    // Partial matching
    const nLower = n.toLowerCase();
    let matched = false;

    // Sort keys by length desc to match "Kizilcahamam" before "Kizil" if applicable
    const keys = Object.keys(manualMap).sort((a, b) => b.length - a.length);

    for (const key of keys) {
        if (n.includes(key) || n === key || nLower.includes(key.toLowerCase())) {
            console.log(`Mapping '${n}' -> '${manualMap[key]}' via key '${key}'`);
            n = manualMap[key];
            matched = true;
            break; // STOP after first match
        }
    }

    if (matched) return n; // Return immediately if manually mapped

    // If still has , try to be smart or generic
    // Replace  with just wildcard or ignore for now?
    // The previous check handled the worst cases.

    return n
        .toLocaleLowerCase("tr")
        .replace(/ı/g, "i")
        .replace(/ğ/g, "g")
        .replace(/ü/g, "u")
        .replace(/ş/g, "s")
        .replace(/ö/g, "o")
        .replace(/ç/g, "c")
        .replace(/\ufffd/g, "") // Remove replacement characters
        .trim();
}

async function importPolygons() {
    const client = new MongoClient(MONGO_URI);

    // Check for required files
    const shpPath = path.join(DATA_DIR, "ankara_districts.shp");
    const dbfPath = path.join(DATA_DIR, "ankara_districts.dbf");

    if (!fs.existsSync(shpPath) || !fs.existsSync(dbfPath)) {
        console.error(`Missing shapefile components. Ensure both .shp and .dbf exist in ${DATA_DIR}`);
        process.exit(1);
    }

    try {
        // Dynamic import for ESM compatibility
        const shp = await import("shpjs");
        // 'combine' is exported directly in the keys based on debug output
        const combine = shp.combine || (shp.default && shp.default.combine);

        if (typeof combine !== 'function') {
            throw new Error("Could not find 'combine' function in shpjs exports: " + Object.keys(shp).join(", "));
        }

        await client.connect();
        const db = client.db(DB_NAME);
        const locationsCol = db.collection("locations");

        console.log("Reading Shapefile...");
        const shpBuffer = fs.readFileSync(shpPath);
        const dbfBuffer = fs.readFileSync(dbfPath);

        // Read DBF data into scope
        let dbfData = [];
        try {
            const parseDbf = shp.parseDbf || (shp.default && shp.default.parseDbf);
            if (parseDbf) {
                dbfData = parseDbf(dbfBuffer, { encoding: 'windows-1254' }); // Added encoding map
                console.log("DBF Records Count:", dbfData.length);
                if (dbfData.length > 0) console.log("First DBF Record:", dbfData[0]);
            }
        } catch (e) {
            console.error("DBF Parse Error:", e);
        }

        // Debug SHP
        try {
            const parseShp = shp.parseShp || (shp.default && shp.default.parseShp);
            if (parseShp) {
                const shapes = parseShp(shpBuffer);
                console.log("SHP Records Count:", shapes.length);

                // If counts match, manually combined
                if (shapes.length === dbfData.length) {
                    console.log(`Counts match (${shapes.length})! Manually combining...`);
                    const geoJSONIter = [];

                    for (let i = 0; i < shapes.length; i++) {
                        geoJSONIter.push({
                            type: "Feature",
                            properties: dbfData[i],
                            geometry: shapes[i]
                        });
                    }
                    // Override the geoJSON variable
                    var manualGeoJSON = { type: "FeatureCollection", features: geoJSONIter };
                }
            }
        } catch (e) {
            console.error("SHP Parse Error:", e);
        }

        // Use manual if available, else standard combine
        const geoJSON = (typeof manualGeoJSON !== 'undefined') ? manualGeoJSON : combine([shpBuffer, dbfBuffer]);

        console.log(`Parsed ${geoJSON.features.length} features.`);

        let matchCount = 0;
        let totalFeatures = 0;

        for (const feature of geoJSON.features) {
            totalFeatures++;
            const props = feature.properties || {};

            // Try to find the name property (case-insensitive search)
            let rawName = null;

            // Common keys like NAME, ADI, ILCE
            // Also handle specific issues: "Kazan" -> "Kahramankazan"

            // Log properties for the first feature to verify
            if (totalFeatures === 1) {
                console.log("First feature properties:", props);
                // process.exit(0); // Optional: stop after first to verify
            }

            const nameKey = Object.keys(props).find(k => k.toLowerCase() === "name_2" || k.toLowerCase() === "name" || k.toLowerCase() === "adi" || k.toLowerCase() === "ilce" || k.toLowerCase() === "ilce_adi");
            if (nameKey) rawName = props[nameKey];

            if (!rawName) {
                // console.log("Skipping feature with no name property.");
                continue;
            }

            let normalizedGeoName = normalizeName(rawName);

            // Manual fixes for known mismatches
            if (normalizedGeoName === "kazan") normalizedGeoName = "kahramankazan";
            if (normalizedGeoName === "sultankochisar") normalizedGeoName = "sereflikochisar"; // Assuming Şereflikoçhisar

            // Match with DB
            const allLocations = await locationsCol.find({}).toArray();
            const matchedLoc = allLocations.find(l => normalizeName(l.district_name || l.name) === normalizedGeoName);

            if (matchedLoc) {
                await locationsCol.updateOne(
                    { _id: matchedLoc._id },
                    {
                        $set: {
                            polygon: feature.geometry
                        }
                    }
                );
                console.log(`Matched: ${rawName} -> ${matchedLoc.district_name}`);
                matchCount++;
            } else {
                console.log(`No match for district: ${rawName} (Normalized: ${normalizedGeoName})`);
            }
        }

        console.log(`Import completed. Matched ${matchCount} / ${totalFeatures} features.`);

    } catch (err) {
        console.error("Error:", err);
    } finally {
        await client.close();
    }
}

importPolygons();
