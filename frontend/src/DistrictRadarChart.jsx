import React from 'react';
import {
    Radar,
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    ResponsiveContainer,
    Tooltip
} from 'recharts';

export default function DistrictRadarChart({ district }) {
    if (!district) return null;

    // Normalize data to be roughly on the same scale (0-100 or 0-10)
    // Urban Score: 1-10 -> x10
    // Air Quality: 0-100 (Lower is better usually, but let's assume raw index for now. 
    // actually standard AQI: 0-50 Good. Let's invert for "Value" meaning "Goodness"?
    // Or just display raw values. Let's display "Performance" where higher is better.

    // Interpretation:
    // Urban Score: Higher is better (0-10)
    // Air Quality: Lower is better (AQI). Let's convert to "Cleanliness" = 100 - AQI (clamped)
    // Traffic: Lower is better. "Flow" = 10 - Traffic
    // Noise: Lower is better. "Quietness" = 100 - Noise (approx)

    // Actually, for simplicity let's plot RAW values normalized to 0-100 scale for visual consistency
    // but clearly labeled.

    const d = district;

    const data = [
        {
            subject: 'Yaşanabilirlik',
            A: Number(d.urban_score) * 10, // 0-100 scale
            fullMark: 100,
        },
        {
            subject: 'Hava Kalitesi (İyi)',
            A: Math.max(0, 100 - Number(d.air_quality)), // Inverted so outer is better
            fullMark: 100,
        },
        {
            subject: 'Trafik (Akıcı)',
            A: Math.max(0, (10 - Number(d.traffic_intensity)) * 10), // Inverted 1-10
            fullMark: 100,
        },
        {
            subject: 'Sessizlik',
            A: Math.max(0, 100 - Number(d.noise_level)), // Inverted
            fullMark: 100,
        },
        {
            subject: 'Nüfus Yoğunluğu (Ters)',
            A: Math.max(0, 100 - (Number(d.population) / 20000)), // Dummy calc for density
            fullMark: 100,
        },
    ];

    return (
        <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
                    <PolarGrid stroke="#475569" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                    <Radar
                        name={d.district_name || d.name}
                        dataKey="A"
                        stroke="#3b82f6"
                        fill="#3b82f6"
                        fillOpacity={0.5}
                    />
                    <Tooltip
                        contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#f1f5f9' }}
                        itemStyle={{ color: '#60a5fa' }}
                    />
                </RadarChart>
            </ResponsiveContainer>
        </div>
    );
}
