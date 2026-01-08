import React, { useState } from 'react';

export default function RecommendationWizard({ locations, onClose, onSelect }) {
    const [step, setStep] = useState(1);
    const [weights, setWeights] = useState({
        air: 50,
        traffic: 50,
        noise: 50,
        urban: 50
    });
    const [results, setResults] = useState([]);

    function calculate() {
        // Simple weighted score
        // precise: air (lower is better in index, but usually higher is better for user. 
        // Assumption: air_quality field is AQI? If so lower is better. 
        // Wait, in previous chart we did 100-AQI. Let's assume input data:
        // Urban Score: Higher better
        // Air: Lower better (AQI)
        // Traffic: Lower better 
        // Noise: Lower better

        const scored = locations.map(loc => {
            const airScore = Math.max(0, 100 - Number(loc.air_quality || 50));
            const trafficScore = Math.max(0, (10 - Number(loc.traffic_intensity || 5)) * 10);
            const noiseScore = Math.max(0, 100 - Number(loc.noise_level || 50));
            const urbanScore = Number(loc.urban_score || 5) * 10;

            const totalScore =
                (airScore * (weights.air / 100)) +
                (trafficScore * (weights.traffic / 100)) +
                (noiseScore * (weights.noise / 100)) +
                (urbanScore * (weights.urban / 100));

            return { ...loc, matchScore: totalScore };
        });

        scored.sort((a, b) => b.matchScore - a.matchScore);
        setResults(scored.slice(0, 3));
        setStep(2);
    }

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.8)', zIndex: 9999,
            display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
            <div style={{ background: '#1e293b', padding: 24, borderRadius: 16, width: 400, maxWidth: '90%', border: '1px solid #334155' }}>

                {step === 1 ? (
                    <>
                        <h3 style={{ color: 'white', marginBottom: 16 }}>Sihirbaz: İlçe Öner</h3>
                        <p style={{ color: '#94a3b8', fontSize: 13, marginBottom: 20 }}>Senin için önemli olan kriterleri belirle, sana en uygun ilçeyi bulalım.</p>

                        {['Hava Kalitesi (air)', 'Az Trafik (traffic)', 'Sessizlik (noise)', 'Yüksek Yaşam Puanı (urban)'].map(labelKey => {
                            const [label, key] = labelKey.split(' (');
                            const realKey = key.replace(')', '');
                            return (
                                <div key={realKey} style={{ marginBottom: 16 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                                        <span style={{ color: '#cbd5e1', fontSize: 13 }}>{label}</span>
                                        <span style={{ color: '#60a5fa', fontSize: 13 }}>%{weights[realKey]}</span>
                                    </div>
                                    <input
                                        type="range"
                                        min="0" max="100"
                                        value={weights[realKey]}
                                        onChange={e => setWeights({ ...weights, [realKey]: Number(e.target.value) })}
                                        style={{ width: '100%', accentColor: '#3b82f6' }}
                                    />
                                </div>
                            )
                        })}

                        <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
                            <button onClick={onClose} style={{ flex: 1, padding: 10, background: 'transparent', border: '1px solid #475569', color: 'white', borderRadius: 8, cursor: 'pointer' }}>İptal</button>
                            <button onClick={calculate} style={{ flex: 2, padding: 10, background: '#2563eb', border: 'none', color: 'white', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}>Sonuçları Gör</button>
                        </div>
                    </>
                ) : (
                    <>
                        <h3 style={{ color: 'white', marginBottom: 16 }}>Önerilen İlçeler</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            {results.map((r, i) => (
                                <div key={r._id}
                                    onClick={() => { onSelect(r); onClose(); }}
                                    style={{
                                        padding: 12, borderRadius: 8,
                                        background: i === 0 ? 'rgba(34, 197, 94, 0.1)' : 'rgba(255,255,255,0.05)',
                                        border: i === 0 ? '1px solid #22c55e' : '1px solid #334155',
                                        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between'
                                    }}
                                >
                                    <div>
                                        <div style={{ color: i === 0 ? '#4ade80' : 'white', fontWeight: 600 }}>#{i + 1} {r.district_name || r.name}</div>
                                        <div style={{ fontSize: 11, color: '#94a3b8' }}>Skor: {r.matchScore.toFixed(0)}</div>
                                    </div>
                                    <button style={{ fontSize: 12, padding: '4px 8px', borderRadius: 4, border: 'none', background: '#3b82f6', color: 'white' }}>Git</button>
                                </div>
                            ))}
                        </div>
                        <button onClick={() => setStep(1)} style={{ marginTop: 20, width: '100%', padding: 10, background: 'transparent', border: '1px solid #475569', color: '#94a3b8', borderRadius: 8, cursor: 'pointer' }}>Geri Dön</button>
                    </>
                )}
            </div>
        </div>
    );
}
