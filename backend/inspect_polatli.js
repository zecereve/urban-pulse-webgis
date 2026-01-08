const { MongoClient } = require("mongodb");

const MONGO_URI =
    "mongodb+srv://ceremvermez_db_user:0611@cluster0.rsymqpq.mongodb.net/urban_pulse?retryWrites=true&w=majority&appName=Cluster0";
const DB_NAME = "urban_pulse";

async function inspectPolatli() {
    const client = new MongoClient(MONGO_URI);
    try {
        await client.connect();
        const db = client.db(DB_NAME);
        const locationsCol = db.collection("locations");

        const items = await locationsCol.find({
            $or: [
                { district_name: "Polatlı" },
                { district_name: "Çankaya" }
            ]
        }).toArray();

        items.forEach(doc => {
            console.log(`\nName: ${doc.district_name}`);
            if (doc.polygon && doc.polygon.coordinates) {
                const ring = doc.polygon.type === "MultiPolygon" ? doc.polygon.coordinates[0][0] : doc.polygon.coordinates[0];
                console.log(`First Point: ${JSON.stringify(ring[0])}`);
            }
        });

    } catch (err) {
        console.error(err);
    } finally {
        await client.close();
    }
}

inspectPolatli();
