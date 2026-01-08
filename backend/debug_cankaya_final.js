const { MongoClient } = require("mongodb");

const MONGO_URI =
    "mongodb+srv://ceremvermez_db_user:0611@cluster0.rsymqpq.mongodb.net/urban_pulse?retryWrites=true&w=majority&appName=Cluster0";
const DB_NAME = "urban_pulse";

async function deepInspect() {
    const client = new MongoClient(MONGO_URI);
    try {
        await client.connect();
        const db = client.db(DB_NAME);
        const locationsCol = db.collection("locations");

        const docs = await locationsCol.find({
            $or: [
                { district_name: "Çankaya" },
                { name: "Çankaya" }
            ]
        }).toArray();

        console.log(`Found ${docs.length} documents for Çankaya.`);

        docs.forEach((d, i) => {
            console.log(`\n--- Doc #${i + 1} ---`);
            console.log(`ID: ${d._id}`);
            console.log(`Name: ${d.name}`);
            console.log(`District Name: ${d.district_name}`);
            console.log(`Lat: ${d.latitude}, Lng: ${d.longitude}`);
            console.log(`Has Polygon: ${!!d.polygon}`);
            if (d.polygon) {
                console.log(`Polygon Type: ${d.polygon.type}`);
                if (d.polygon.coordinates && d.polygon.coordinates[0]) {
                    const ring = d.polygon.type === "MultiPolygon" ? d.polygon.coordinates[0][0] : d.polygon.coordinates[0];
                    console.log(`Ring 0 Points: ${ring.length}`);
                    console.log(`First 5 Coords:`, JSON.stringify(ring.slice(0, 5)));
                }
                console.log(`Urban Score: ${d.urban_score}`);
            }
        });

    } catch (err) {
        console.error(err);
    } finally {
        await client.close();
    }
}

deepInspect();
