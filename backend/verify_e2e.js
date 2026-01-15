const http = require('http');
const { MongoClient } = require("mongodb");

const MONGO_URI = "mongodb+srv://ceremvermez_db_user:0611@cluster0.rsymqpq.mongodb.net/urban_pulse?retryWrites=true&w=majority&appName=Cluster0";

function postIssue() {
    return new Promise((resolve, reject) => {
        const data = JSON.stringify({
            lat: 39.92,
            lng: 32.85,
            type: "test_persistence_" + Date.now(),
            description: "Automated test issue",
            district_id: null
        });

        const req = http.request({
            hostname: 'localhost',
            port: 5050,
            path: '/api/issues',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': data.length
            }
        }, (res) => {
            let body = '';
            res.on('data', (chunk) => body += chunk);
            res.on('end', () => {
                console.log("API POST Status:", res.statusCode);
                resolve(body);
            });
        });

        req.on('error', (e) => reject(e));
        req.write(data);
        req.end();
    });
}

function getIssues() {
    return new Promise((resolve, reject) => {
        http.get('http://localhost:5050/api/issues', (res) => {
            let body = '';
            res.on('data', (chunk) => body += chunk);
            res.on('end', () => {
                console.log("API GET Status:", res.statusCode);
                resolve(JSON.parse(body));
            });
        }).on('error', reject);
    });
}

async function verify() {
    console.log("1. Checking DB count before...");
    const client = await MongoClient.connect(MONGO_URI);
    const db = client.db("urban_pulse");
    const countBefore = await db.collection("issues").countDocuments();
    console.log("DB Count:", countBefore);

    console.log("2. Sending POST to API...");
    try {
        await postIssue();
    } catch (e) {
        console.log("POST Failed (Backend might not be running on 5050):", e.message);
    }

    console.log("3. Checking DB count after...");
    const countAfter = await db.collection("issues").countDocuments();
    console.log("DB Count:", countAfter);

    if (countAfter > countBefore) {
        console.log("SUCCESS: Data persisted in DB via API!");
    } else {
        console.log("FAILURE: Data did NOT increase in DB.");
    }

    console.log("4. Fetching from API...");
    try {
        const issues = await getIssues();
        const found = issues.find(i => i.type.startsWith("test_persistence"));
        if (found) {
            console.log("SUCCESS: API returned the new issue!");
        } else {
            console.log("FAILURE: API did not return the new issue.");
        }
    } catch (e) {
        console.log("GET Failed:", e.message);
    }

    await db.collection("issues").deleteMany({ type: { $regex: "^test_persistence" } }); // Cleanup
    await client.close();
}

verify();
