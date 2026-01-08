const { MongoClient } = require("mongodb");

const MONGO_URI =
    "mongodb+srv://ceremvermez_db_user:0611@cluster0.rsymqpq.mongodb.net/urban_pulse?retryWrites=true&w=majority&appName=Cluster0";
const DB_NAME = "urban_pulse";

// Data from seed.js
const DISTRICTS_DATA = [
    // MERKEZ İLÇELER (Metropol)
    // Çankaya: Yüksek yaşam kalitesi, ama yüksek trafik ve gürültü. Suç oransal olarak yüksek (hırsızlık) ama algı güvenli.
    { name: "Çankaya", lat: 39.9167, lng: 32.85, population: 947330, urban_score: 9.1, air_quality: 68, traffic_intensity: 9.8, noise_level: 78, density: "Very High" },

    // Keçiören: Kalabalık, hava kalitesi kışın düşebiliyor, trafik yoğun, güvenlik orta seviye.
    { name: "Keçiören", lat: 39.9754, lng: 32.8644, population: 932128, urban_score: 7.4, air_quality: 75, traffic_intensity: 8.9, noise_level: 72, density: "Very High" },

    // Yenimahalle: Batıkent/Çayyolu güvenli ve düzenli, ancak Ostim tarafı gürültülü. Havası orta.
    { name: "Yenimahalle", lat: 39.9678, lng: 32.7936, population: 714866, urban_score: 8.3, air_quality: 65, traffic_intensity: 8.2, noise_level: 74, density: "High" },

    // Mamak: Sosyoekonomik gelişim sürüyor, hava kalitesi rüzgarı az aldığı için orta-kötü, güvenlik geliştirmeye açık.
    { name: "Mamak", lat: 39.9126, lng: 32.9366, population: 686777, urban_score: 6.7, air_quality: 72, traffic_intensity: 7.5, noise_level: 68, density: "High" },

    // Etimesgut: Hızla gelişiyor, modern siteler (Eryaman), trafik artıyor, hava nispeten iyi.
    { name: "Etimesgut", lat: 39.9442, lng: 32.6672, population: 629112, urban_score: 8.0, air_quality: 50, traffic_intensity: 7.0, noise_level: 62, density: "High" },

    // Sincan: Sanayi yoğunluğu, merkeze uzak, trafik kendi içinde yoğun, hava kalitesi sanayi etkisiyle değişken.
    { name: "Sincan", lat: 39.9625, lng: 32.5719, population: 590309, urban_score: 6.8, air_quality: 60, traffic_intensity: 6.5, noise_level: 65, density: "Medium-High" },

    // Altındağ: Tarihi merkez ama eski yerleşim, kentsel dönüşüm var. Güvenlik sorunları (raporlara göre) en yüksek ilçelerden.
    { name: "Altındağ", lat: 39.9419, lng: 32.8569, population: 414893, urban_score: 6.0, air_quality: 78, traffic_intensity: 8.5, noise_level: 75, density: "High" },

    // Pursaklar: Havaalanı yolu, düzenli yapılaşma, orta-üst trafik.
    { name: "Pursaklar", lat: 40.0383, lng: 32.8986, population: 165665, urban_score: 7.2, air_quality: 45, traffic_intensity: 6.0, noise_level: 58, density: "Medium" },

    // Gölbaşı: Villa tipi yerleşim (İncek), göl kenarı, hava temiz, trafik hafta sonu yoğun.
    { name: "Gölbaşı", lat: 39.7892, lng: 32.8227, population: 165201, urban_score: 8.6, air_quality: 25, traffic_intensity: 5.0, noise_level: 45, density: "Variable" },

    // DIŞ İLÇELER (Kırsal / Turistik)
    // Beypazarı: Turistik, çok güvenli, havası temiz.
    { name: "Beypazarı", lat: 40.1691, lng: 31.9197, population: 48445, urban_score: 7.8, air_quality: 15, traffic_intensity: 3.0, noise_level: 35, density: "Low" },

    // Kızılcahamam: Ormanlık, kaplıca, en temiz hava (AQI ~10).
    { name: "Kızılcahamam", lat: 40.4705, lng: 32.6486, population: 28823, urban_score: 8.2, air_quality: 10, traffic_intensity: 2.5, noise_level: 30, density: "Low" },

    // Şereflikoçhisar: Tuz Gölü yanı, kurak, sanayi yok, sessiz.
    { name: "Şereflikoçhisar", lat: 38.9372, lng: 33.5386, population: 33316, urban_score: 5.8, air_quality: 20, traffic_intensity: 2.0, noise_level: 35, density: "Low" },

    // Polatlı: Tarım merkezi, yoğun karayolu geçişi (kamyon trafiği), gürültü orta.
    { name: "Polatlı", lat: 39.5847, lng: 32.1311, population: 130515, urban_score: 6.2, air_quality: 40, traffic_intensity: 4.5, noise_level: 52, density: "Medium" },

    // Çamlıdere: En sessiz ilçe, doğa, çok düşük nüfus.
    { name: "Çamlıdere", lat: 40.4905, lng: 32.4744, population: 10475, urban_score: 7.9, air_quality: 5, traffic_intensity: 1.0, noise_level: 20, density: "Very Low" },

    // Diğerleri (Genelleştirilmiş Kırsal Profili)
    { name: "Çubuk", lat: 40.2311, lng: 33.0298, population: 100750, urban_score: 6.5, air_quality: 35, traffic_intensity: 3.5, noise_level: 42, density: "Low-Medium" },
    { name: "Kahramankazan", lat: 40.1983, lng: 32.6841, population: 62060, urban_score: 6.9, air_quality: 40, traffic_intensity: 4.8, noise_level: 50, density: "Medium" }, // Sanayiye yakın
    { name: "Elmadağ", lat: 39.9238, lng: 33.2289, population: 45133, urban_score: 6.0, air_quality: 35, traffic_intensity: 3.2, noise_level: 45, density: "Low" },
    { name: "Akyurt", lat: 40.1333, lng: 33.0833, population: 44541, urban_score: 6.6, air_quality: 30, traffic_intensity: 3.5, noise_level: 44, density: "Low" },
    { name: "Haymana", lat: 39.4325, lng: 32.4961, population: 27241, urban_score: 5.5, air_quality: 15, traffic_intensity: 1.8, noise_level: 32, density: "Low" },
    { name: "Nallıhan", lat: 40.1833, lng: 31.3500, population: 26488, urban_score: 7.0, air_quality: 12, traffic_intensity: 1.5, noise_level: 30, density: "Low" }, // Kuş cenneti vb.
    { name: "Bala", lat: 39.5539, lng: 33.1236, population: 21893, urban_score: 5.2, air_quality: 15, traffic_intensity: 1.6, noise_level: 30, density: "Low" },
    { name: "Ayaş", lat: 40.0167, lng: 32.3333, population: 13670, urban_score: 6.5, air_quality: 20, traffic_intensity: 2.2, noise_level: 35, density: "Low" },
    { name: "Kalecik", lat: 40.0964, lng: 33.4092, population: 12801, urban_score: 5.8, air_quality: 18, traffic_intensity: 1.8, noise_level: 32, density: "Low" },
    { name: "Güdül", lat: 40.2089, lng: 32.2289, population: 8521, urban_score: 6.5, air_quality: 10, traffic_intensity: 1.3, noise_level: 28, density: "Low" },
    { name: "Evren", lat: 39.0272, lng: 33.7997, population: 3096, urban_score: 5.6, air_quality: 8, traffic_intensity: 1.0, noise_level: 25, density: "Low" },
];

function normalizeName(name) {
    if (!name) return "";
    return String(name)
        .toLocaleLowerCase("tr")
        .replace(/ı/g, "i")
        .replace(/ğ/g, "g")
        .replace(/ü/g, "u")
        .replace(/ş/g, "s")
        .replace(/ö/g, "o")
        .replace(/ç/g, "c")
        .trim();
}

async function updateMetrics() {
    let client;
    try {
        client = await MongoClient.connect(MONGO_URI);
        const db = client.db(DB_NAME);
        const locationsCol = db.collection("locations");

        console.log("Updating metrics for existing polygons...");
        const allDocs = await locationsCol.find({}).toArray();
        console.log(`Found ${allDocs.length} documents.`);

        for (const doc of allDocs) {
            const docNameNorm = normalizeName(doc.district_name || doc.name);

            // Find matching data from SEED
            const seedData = DISTRICTS_DATA.find(d => normalizeName(d.name) === docNameNorm);

            if (seedData) {
                // Update stats
                await locationsCol.updateOne(
                    { _id: doc._id },
                    {
                        $set: {
                            population: seedData.population,
                            urban_score: seedData.urban_score,
                            air_quality: seedData.air_quality,
                            traffic_intensity: seedData.traffic_intensity,
                            noise_level: seedData.noise_level,
                            district_name: seedData.name, // Fix casing if needed
                            updatedAt: new Date()
                        }
                    }
                );
                console.log(`Updated stats for: ${seedData.name}`);
            } else {
                console.log(`No seed data found for: ${doc.district_name}`);
                // Optional: generate random if missing?
                // For now, let's stick to the list.
            }
        }
        console.log("Update complete.");

    } catch (err) {
        console.error(err);
    } finally {
        if (client) client.close();
    }
}

updateMetrics();
