const { MongoClient } = require("mongodb");

const MONGO_URI =
    "mongodb+srv://ceremvermez_db_user:0611@cluster0.rsymqpq.mongodb.net/urban_pulse?retryWrites=true&w=majority&appName=Cluster0";
const DB_NAME = "urban_pulse";

// Ankara Merkez Koordinat
const ANKARA_CENTER = { lat: 39.9334, lng: 32.8597 };

// Gerçek Nüfus Verileri (2024 TÜİK) ve Tahmini Urban Score/Hava/Trafik Değerleri
// Urban Score: 1-10 (10 = En Yüksek Yaşam Kalitesi)
// Hava Kalitesi: 0-100 (Düşük = İyi, Yüksek = Kötü - AQI mantığı)
// Trafik: 1-10 (1 = Boş, 10 = Çok Yoğun)
// Gürültü: dB cinsinden tahmin
const DISTRICTS_DATA = [
    { name: "Çankaya", lat: 39.9167, lng: 32.85, population: 947330, urban_score: 8.9, air_quality: 55, traffic_intensity: 9.2, noise_level: 75, density: "High" },
    { name: "Keçiören", lat: 39.9754, lng: 32.8644, population: 932128, urban_score: 7.5, air_quality: 60, traffic_intensity: 8.5, noise_level: 70, density: "High" },
    { name: "Yenimahalle", lat: 39.9678, lng: 32.7936, population: 714866, urban_score: 8.2, air_quality: 50, traffic_intensity: 7.8, noise_level: 65, density: "High" },
    { name: "Mamak", lat: 39.9126, lng: 32.9366, population: 686777, urban_score: 6.8, air_quality: 65, traffic_intensity: 7.5, noise_level: 68, density: "High" },
    { name: "Etimesgut", lat: 39.9442, lng: 32.6672, population: 629112, urban_score: 7.9, air_quality: 45, traffic_intensity: 6.5, noise_level: 60, density: "Medium-High" },
    { name: "Sincan", lat: 39.9625, lng: 32.5719, population: 590309, urban_score: 6.5, air_quality: 55, traffic_intensity: 6.0, noise_level: 62, density: "Medium-High" },
    { name: "Altındağ", lat: 39.9419, lng: 32.8569, population: 414893, urban_score: 6.2, air_quality: 70, traffic_intensity: 8.0, noise_level: 72, density: "High" },
    { name: "Pursaklar", lat: 40.0383, lng: 32.8986, population: 165665, urban_score: 7.0, air_quality: 40, traffic_intensity: 5.5, noise_level: 55, density: "Medium" },
    { name: "Gölbaşı", lat: 39.7892, lng: 32.8227, population: 165201, urban_score: 8.5, air_quality: 25, traffic_intensity: 4.5, noise_level: 45, density: "Medium" },
    { name: "Polatlı", lat: 39.5847, lng: 32.1311, population: 130515, urban_score: 6.0, air_quality: 35, traffic_intensity: 4.0, noise_level: 50, density: "Medium" },
    { name: "Çubuk", lat: 40.2311, lng: 33.0298, population: 100750, urban_score: 6.3, air_quality: 30, traffic_intensity: 3.5, noise_level: 40, density: "Low-Medium" },
    { name: "Kahramankazan", lat: 40.1983, lng: 32.6841, population: 62060, urban_score: 6.8, air_quality: 35, traffic_intensity: 4.2, noise_level: 48, density: "Low-Medium" },
    { name: "Beypazarı", lat: 40.1691, lng: 31.9197, population: 48445, urban_score: 7.2, air_quality: 20, traffic_intensity: 2.5, noise_level: 35, density: "Low" },
    { name: "Elmadağ", lat: 39.9238, lng: 33.2289, population: 45133, urban_score: 5.8, air_quality: 30, traffic_intensity: 3.0, noise_level: 45, density: "Low" },
    { name: "Akyurt", lat: 40.1333, lng: 33.0833, population: 44541, urban_score: 6.5, air_quality: 25, traffic_intensity: 3.2, noise_level: 42, density: "Low" },
    { name: "Şereflikoçhisar", lat: 38.9372, lng: 33.5386, population: 33316, urban_score: 5.5, air_quality: 15, traffic_intensity: 2.0, noise_level: 35, density: "Low" },
    { name: "Kızılcahamam", lat: 40.4705, lng: 32.6486, population: 28823, urban_score: 8.0, air_quality: 10, traffic_intensity: 2.2, noise_level: 30, density: "Low" },
    { name: "Haymana", lat: 39.4325, lng: 32.4961, population: 27241, urban_score: 5.2, air_quality: 15, traffic_intensity: 1.8, noise_level: 32, density: "Low" },
    { name: "Nallıhan", lat: 40.1833, lng: 31.3500, population: 26488, urban_score: 6.9, air_quality: 12, traffic_intensity: 1.5, noise_level: 30, density: "Low" },
    { name: "Bala", lat: 39.5539, lng: 33.1236, population: 21893, urban_score: 5.0, air_quality: 15, traffic_intensity: 1.6, noise_level: 30, density: "Low" },
    { name: "Ayaş", lat: 40.0167, lng: 32.3333, population: 13670, urban_score: 6.4, air_quality: 20, traffic_intensity: 2.0, noise_level: 35, density: "Low" },
    { name: "Kalecik", lat: 40.0964, lng: 33.4092, population: 12801, urban_score: 5.6, air_quality: 18, traffic_intensity: 1.8, noise_level: 32, density: "Low" },
    { name: "Çamlıdere", lat: 40.4905, lng: 32.4744, population: 10475, urban_score: 7.5, air_quality: 5, traffic_intensity: 1.2, noise_level: 25, density: "Low" },
    { name: "Güdül", lat: 40.2089, lng: 32.2289, population: 8521, urban_score: 6.2, air_quality: 10, traffic_intensity: 1.3, noise_level: 28, density: "Low" },
    { name: "Evren", lat: 39.0272, lng: 33.7997, population: 3096, urban_score: 5.5, air_quality: 8, traffic_intensity: 1.0, noise_level: 25, density: "Low" },
];

async function seed() {
    let client;
    try {
        client = await MongoClient.connect(MONGO_URI);
        const db = client.db(DB_NAME);
        const locationsCol = db.collection("locations");

        console.log("Database seeding started with REAL data...");

        for (const dist of DISTRICTS_DATA) {
            const updateDoc = {
                $set: {
                    district_name: dist.name,
                    latitude: dist.lat,
                    longitude: dist.lng,
                    urban_score: dist.urban_score,
                    air_quality: dist.air_quality,
                    traffic_intensity: dist.traffic_intensity,
                    noise_level: dist.noise_level,
                    population: dist.population,
                    updatedAt: new Date(),
                },
            };

            await locationsCol.updateOne(
                { district_name: dist.name },
                updateDoc,
                { upsert: true }
            );
            console.log(`Upserted: ${dist.name}`);
        }

        console.log("Seeding completed successfully.");
    } catch (err) {
        console.error("Seed error:", err);
    } finally {
        if (client) client.close();
    }
}

seed();
