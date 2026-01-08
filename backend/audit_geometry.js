const { MongoClient } = require("mongodb");

const MONGO_URI =
    "mongodb+srv://ceremvermez_db_user:0611@cluster0.rsymqpq.mongodb.net/urban_pulse?retryWrites=true&w=majority&appName=Cluster0";
const DB_NAME = "urban_pulse";

async function audit() {
    const client = new MongoClient(MONGO_URI);
    try {
        await client.connect();
        const db = client.db(DB_NAME);
        const locationsCol = db.collection("locations");

        const docs = await locationsCol.find({}).toArray();

        // Sort by name for readability
        docs.sort((a, b) => (a.district_name || a.name).localeCompare(b.district_name || b.name));

        console.log("Name | First Lon | First Lat");
        console.log("---|---|---");

        docs.forEach(d => {
            const name = d.district_name || d.name;
            let p = [0, 0];
            if (d.polygon && d.polygon.coordinates) {
                const ring = d.polygon.type === "MultiPolygon" ? d.polygon.coordinates[0][0] : d.polygon.coordinates[0];
                p = ring[0];
            }
            // Format to 2 decimals
            const lon = typeof p[0] === 'number' ? p[0].toFixed(2) : "N/A";
            const lat = typeof p[1] === 'number' ? p[1].toFixed(2) : "N/A";

            console.log(`${name} | ${lon} | ${lat}`);
        });

    } catch (err) {
        console.error(err);
    } finally {
        await client.close();
    }
}

audit();
