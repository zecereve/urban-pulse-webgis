const { MongoClient } = require("mongodb");

const MONGO_URI =
    "mongodb+srv://ceremvermez_db_user:0611@cluster0.rsymqpq.mongodb.net/urban_pulse?retryWrites=true&w=majority&appName=Cluster0";
const DB_NAME = "urban_pulse";

async function checkDuplicates() {
    const client = new MongoClient(MONGO_URI);
    try {
        await client.connect();
        const db = client.db(DB_NAME);
        const locationsCol = db.collection("locations");

        const targets = ["Çankaya", "Keçiören", "Yenimahalle", "Pursaklar"];

        for (const name of targets) {
            // Case insensitive regex
            const docs = await locationsCol.find({
                $or: [
                    { district_name: name },
                    { name: name }
                ]
            }).toArray();

            console.log(`\n--- ${name} ---`);
            console.log(`Found ${docs.length} documents.`);
            docs.forEach((doc, i) => {
                const hasPoly = doc.polygon ? "YES" : "NO";
                const polySize = doc.polygon ? JSON.stringify(doc.polygon).length : 0;
                console.log(`  ${i + 1}. ID: ${doc._id}, Name: ${doc.district_name || doc.name}, Has Polygon: ${hasPoly} (Size: ${polySize})`);
            });
        }

    } catch (err) {
        console.error(err);
    } finally {
        await client.close();
    }
}

checkDuplicates();
