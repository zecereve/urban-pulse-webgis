const fs = require('fs');

const report = JSON.parse(fs.readFileSync('report.json', 'utf8'));
const intermediate = report.intermediate;

const labels = intermediate.map((step, index) => `${index * 10}s`);
const responseTimes = intermediate.map(step => step.summaries['http.response_time'] ? step.summaries['http.response_time'].p95 : 0);
const userCounts = intermediate.map(step => step.counters['vusers.created'] || 0);

const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <title>Performance Test Results</title>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <style>
        body { font-family: sans-serif; padding: 20px; background: white; }
        .container { width: 800px; margin: 0 auto; }
        h2 { text-align: center; color: #333; }
    </style>
</head>
<body>
    <div class="container">
        <h2>Urban Pulse API - Load Test Performance</h2>
        <canvas id="perfChart"></canvas>
    </div>
    <script>
        const ctx = document.getElementById('perfChart').getContext('2d');
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: ${JSON.stringify(labels)},
                datasets: [
                    {
                        label: 'Response Time (p95, ms)',
                        data: ${JSON.stringify(responseTimes)},
                        borderColor: 'rgb(255, 99, 132)',
                        yAxisID: 'y',
                        tension: 0.1
                    },
                    {
                        label: 'Virtual Users',
                        data: ${JSON.stringify(userCounts)},
                        borderColor: 'rgb(54, 162, 235)',
                        yAxisID: 'y1',
                        tension: 0.1
                    }
                ]
            },
            options: {
                responsive: true,
                interaction: {
                    mode: 'index',
                    intersect: false,
                },
                stacked: false,
                scales: {
                    y: {
                        type: 'linear',
                        display: true,
                        position: 'left',
                        title: { display: true, text: 'Response Time (ms)' }
                    },
                    y1: {
                        type: 'linear',
                        display: true,
                        position: 'right',
                        grid: { drawOnChartArea: false },
                        title: { display: true, text: 'Active Users' }
                    }
                }
            }
        });
    </script>
</body>
</html>
`;

fs.writeFileSync('performance_graph.html', htmlContent);
console.log('Graph HTML generated: performance_graph.html');
