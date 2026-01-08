const http = require('http');

const OPTIONS = {
    hostname: 'localhost',
    port: 5050,
    path: '/api/issues',
    method: 'GET',
};

const TOTAL_REQUESTS = 500;
const CONCURRENCY = 20;

let completed = 0;
let success = 0;
let fail = 0;
const startTime = Date.now();

console.log(`Starting Load Test: ${TOTAL_REQUESTS} requests, concurrency ${CONCURRENCY}...`);

function makeRequest() {
    if (completed >= TOTAL_REQUESTS) return;

    const req = http.request(OPTIONS, (res) => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
            success++;
        } else {
            fail++;
        }
        res.on('data', () => { }); // Consume stream
        res.on('end', () => {
            completed++;
            if (completed % 50 === 0) console.log(`Progress: ${completed}/${TOTAL_REQUESTS}`);
            if (completed < TOTAL_REQUESTS) {
                makeRequest(); // Next one
            } else if (completed === TOTAL_REQUESTS) {
                printResults();
            }
        });
    });

    req.on('error', (e) => {
        fail++;
        completed++;
        console.error(e.message);
        if (completed === TOTAL_REQUESTS) printResults();
        else makeRequest();
    });

    req.end();
}

function printResults() {
    const duration = (Date.now() - startTime) / 1000;
    const rps = (completed / duration).toFixed(2);
    console.log(`\n\n--- Load Test Results ---`);
    console.log(`Total Requests: ${completed}`);
    console.log(`Successful: ${success}`);
    console.log(`Failed: ${fail}`);
    console.log(`Duration: ${duration}s`);
    console.log(`Requests Per Second (RPS): ${rps}`);
    console.log(`-------------------------\n`);
}

// Start concurrent batches
for (let i = 0; i < CONCURRENCY; i++) {
    makeRequest();
}
