const { MongoClient } = require("mongodb");

const MONGO_URI =
    "mongodb+srv://ceremvermez_db_user:0611@cluster0.rsymqpq.mongodb.net/urban_pulse?retryWrites=true&w=majority&appName=Cluster0";
const DB_NAME = "urban_pulse";

async function deduplicate() {
    const client = new MongoClient(MONGO_URI);
    try {
        await client.connect();
        const db = client.db(DB_NAME);
        const locationsCol = db.collection("locations");

        const allDocs = await locationsCol.find({}).toArray();
        const seen = {};

        let removedCount = 0;

        for (const doc of allDocs) {
            const name = doc.district_name || doc.name;
            if (!name) continue;

            // Strategy: Keep the one with polygon. If both have polygon, keep first?

            if (seen[name]) {
                const existing = seen[name];

                // Decide which to keep
                let keepExisting = true;

                // If existing has no polygon but current does, swap
                if (!existing.polygon && doc.polygon) {
                    keepExisting = false;
                }

                if (keepExisting) {
                    // Remove current
                    console.log(`Duplicate ${name}. Removing ID: ${doc._id} (HasPoly: ${!!doc.polygon})`);
                    await locationsCol.deleteOne({ _id: doc._id });
                    removedCount++;
                } else {
                    // Remove existing, update seen to current
                    console.log(`Duplicate ${name}. Removing ID: ${existing._id} (HasPoly: ${!!existing.polygon})`);
                    await locationsCol.deleteOne({ _id: existing._id });
                    seen[name] = doc;
                    removedCount++;
                }
            } else {
                seen[name] = doc;
            }
        }

        console.log(`\nCompleted. Removed ${removedCount} duplicates.`);

    } catch (err) {
        console.error(err);
    } finally {
        await client.close();
    }
}

deduplicate();
