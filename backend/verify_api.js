const http = require('http');

const url = 'http://localhost:5050/api/urban/locations';

http.get(url, (res) => {
    let data = '';
    res.on('data', (chunk) => data += chunk);
    res.on('end', () => {
        try {
            const json = JSON.parse(data);
            console.log(`Expected Array? ${Array.isArray(json)}`);
            console.log(`Total Count: ${json.length}`);

            const cankaya = json.find(d => (d.district_name || d.name) === 'Çankaya');
            if (cankaya) {
                console.log('Çankaya FOUND in API response.');
                console.log(`ID: ${cankaya._id}`);
                console.log(`Has Polygon: ${!!cankaya.polygon}`);
                if (cankaya.polygon) {
                    console.log(`Polygon Type: ${cankaya.polygon.type}`);
                    // Check coordinates structure briefly
                    const ring = cankaya.polygon.type === 'MultiPolygon' ? cankaya.polygon.coordinates[0][0] : cankaya.polygon.coordinates[0];
                    console.log(`First Coord: ${JSON.stringify(ring[0])}`);
                }
                console.log(`Lat: ${cankaya.latitude}, Lng: ${cankaya.longitude}`);
            } else {
                console.log('Çankaya NOT FOUND in API response.');
            }

        } catch (e) {
            console.error('JSON Parse Error:', e);
        }
    });
}).on('error', (err) => {
    console.error('Request Error:', err);
});
