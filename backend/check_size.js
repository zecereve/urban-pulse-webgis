const { MongoClient } = require("mongodb");

const MONGO_URI =
    "mongodb+srv://ceremvermez_db_user:0611@cluster0.rsymqpq.mongodb.net/urban_pulse?retryWrites=true&w=majority&appName=Cluster0";
const DB_NAME = "urban_pulse";

async function checkSize() {
    const client = new MongoClient(MONGO_URI);
    try {
        await client.connect();
        const db = client.db(DB_NAME);
        const locationsCol = db.collection("locations");

        const docs = await locationsCol.find({}).toArray();
        docs.forEach(d => {
            const hasPoly = d.polygon ? "YES" : "NO";
            const keys = Object.keys(d).join(", ");
            const name = d.district_name || d.name || "UNNAMED";
            console.log(`- ${name} [${keys}] Poly: ${hasPoly}`);
            if (name.includes("Çankaya")) {
                console.log("   --> Çankaya FOUND. district_name:", d.district_name, "name:", d.name);
            }
        });

    } catch (err) {
        console.error(err);
    } finally {
        await client.close();
    }
}

checkSize();
