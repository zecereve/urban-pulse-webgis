const { MongoClient } = require("mongodb");
const MONGO_URI = "mongodb+srv://ceremvermez_db_user:0611@cluster0.rsymqpq.mongodb.net/urban_pulse?retryWrites=true&w=majority&appName=Cluster0";
const DB_NAME = "urban_pulse";

async function verify() {
    const client = new MongoClient(MONGO_URI);
    await client.connect();
    const db = client.db(DB_NAME);
    const locations = await db.collection("locations").find({ polygon: { $exists: true } }).toArray();
    console.log(`Found ${locations.length} locations with polygon data.`);
    locations.slice(0, 3).forEach(l => console.log(`${l.name || l.district_name}: Polygon type ${l.polygon.type}`));

    // Check missing ones
    const missing = await db.collection("locations").find({ polygon: { $exists: false } }).toArray();
    console.log(`Found ${missing.length} locations WITHOUT polygon data.`);
    missing.forEach(l => console.log(`Missing: ${l.name || l.district_name}`));

    await client.close();
}
verify();
