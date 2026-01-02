const { MongoClient } = require("mongodb");

const MONGO_URI =
    "mongodb+srv://ceremvermez_db_user:0611@cluster0.rsymqpq.mongodb.net/urban_pulse?retryWrites=true&w=majority&appName=Cluster0";
const DB_NAME = "urban_pulse";

async function createIndex() {
    const client = new MongoClient(MONGO_URI);
    try {
        await client.connect();
        const db = client.db(DB_NAME);
        const locationsCol = db.collection("locations");

        console.log("Creating 2dsphere index on 'locations' collection...");
        // 2dsphere index (latitude/longitude pairs)
        // IMPORTANT: MongoDB expects [longitude, latitude] order for legacy coordinate pairs if using array,
        // but here we likely have separate fields. If we want a geospatial index on separate fields, 
        // we strictly need a GeoJSON object or a legacy coordinate pair field.
        // 
        // Looking at seed.js:
        // locationsCol.updateOne(..., { $set: { latitude: ..., longitude: ... } })
        //
        // MongoDB 2d/2dsphere indexes usually require a specific field structure (GeoJSON Point or legacy array).
        // Let's first update our data to have a GeoJSON 'location' field if it doesn't exist, 
        // OR create a compound index if supported, but 2dsphere works best with GeoJSON.

        // Step 1: Add a 'location' field (GeoJSON Point) to all documents based on lat/lng
        console.log("Updating documents to include GeoJSON 'location' field...");
        const cursor = locationsCol.find({});
        while (await cursor.hasNext()) {
            const doc = await cursor.next();
            if (doc.latitude && doc.longitude) {
                await locationsCol.updateOne(
                    { _id: doc._id },
                    {
                        $set: {
                            location: {
                                type: "Point",
                                coordinates: [doc.longitude, doc.latitude], // Longitude first!
                            },
                        },
                    }
                );
            }
        }

        // Step 2: Create the index
        const result = await locationsCol.createIndex({ location: "2dsphere" });
        console.log(`Index created: ${result}`);

    } catch (err) {
        console.error("Index creation error:", err);
    } finally {
        await client.close();
    }
}

createIndex();
