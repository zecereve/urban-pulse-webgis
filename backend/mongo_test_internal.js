const { MongoClient } = require("mongodb");

const MONGO_URI = "mongodb+srv://ceremvermez_db_user:0611@cluster0.rsymqpq.mongodb.net/urban_pulse?retryWrites=true&w=majority&appName=Cluster0";

async function testConnection() {
    console.log("Connecting to:", MONGO_URI);
    try {
        const client = await MongoClient.connect(MONGO_URI, { connectTimeoutMS: 5000 });
        console.log("Connection SUCCESS!");
        const db = client.db("urban_pulse");
        const collections = await db.listCollections().toArray();
        console.log("Collections:", collections.map(c => c.name));
        await client.close();
    } catch (err) {
        console.error("Connection FAILED:", err.message);
    }
}

testConnection();
