const { MongoClient } = require("mongodb");

const MONGO_URI =
    "mongodb+srv://ceremvermez_db_user:0611@cluster0.rsymqpq.mongodb.net/urban_pulse?retryWrites=true&w=majority&appName=Cluster0";
const DB_NAME = "urban_pulse";

async function fixCoords() {
    const client = new MongoClient(MONGO_URI);
    try {
        await client.connect();
        const db = client.db(DB_NAME);
        const locationsCol = db.collection("locations");

        const updates = [
            { name: "Çankaya", lat: 39.9208, lng: 32.8541 },
            { name: "Keçiören", lat: 40.0175, lng: 32.8623 },
            { name: "Yenimahalle", lat: 39.9708, lng: 32.8090 }
        ];

        for (const u of updates) {
            console.log(`Updating ${u.name}...`);
            const res = await locationsCol.updateOne(
                { $or: [{ name: u.name }, { district_name: u.name }] },
                {
                    $set: {
                        latitude: u.lat,
                        longitude: u.lng,
                        // Ensure district_name is set too, for consistency
                        district_name: u.name
                    }
                }
            );
            console.log(`Matched: ${res.matchedCount}, Modified: ${res.modifiedCount}`);
        }

    } catch (err) {
        console.error(err);
    } finally {
        await client.close();
    }
}

fixCoords();
