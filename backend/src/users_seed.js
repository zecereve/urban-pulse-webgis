const { MongoClient } = require("mongodb");
const bcrypt = require("bcrypt");

const MONGO_URI = "mongodb+srv://ceremvermez_db_user:0611@cluster0.rsymqpq.mongodb.net/urban_pulse?retryWrites=true&w=majority&appName=Cluster0";
const DB_NAME = "urban_pulse";

async function seedUsers() {
    let client;
    try {
        client = await MongoClient.connect(MONGO_URI);
        const db = client.db(DB_NAME);
        const usersCol = db.collection("users");

        console.log("Seeding default admin user...");

        // Define default admin
        const email = "admin@urbanpulse.com";
        const plainPassword = "admin";

        // Hash password
        const hashedPassword = await bcrypt.hash(plainPassword, 10);

        // Remove existing if any
        await usersCol.deleteMany({ email: email });

        // Insert new admin
        await usersCol.insertOne({
            email,
            password: hashedPassword,
            role: "admin",
            createdAt: new Date()
        });

        console.log(`User created: ${email} / ${plainPassword}`);

        // Define default analyst
        const analystEmail = "analyst@urbanpulse.com";
        const analystPassword = "analyst";
        const hashedAnalystPassword = await bcrypt.hash(analystPassword, 10);

        await usersCol.deleteMany({ email: analystEmail });

        await usersCol.insertOne({
            email: analystEmail,
            password: hashedAnalystPassword,
            role: "analyst",
            createdAt: new Date()
        });
        console.log(`User created: ${analystEmail} / ${analystPassword}`);

        console.log("PLEASE USE THESE USERS TO LOGIN.");

    } catch (err) {
        console.error("Seed error:", err);
    } finally {
        if (client) client.close();
    }
}

seedUsers();
