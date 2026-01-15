import React, { useState } from 'react';

const API_BASE = "/api";

export default function IssueModal(props) {
    const { latlng, onClose, onSuccess } = props;
    const [type, setType] = useState('pothole');
    const [desc, setDesc] = useState('');
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const formData = new FormData();
            formData.append('type', type);
            formData.append('description', desc);
            formData.append('lat', latlng.lat);
            formData.append('lng', latlng.lng);
            if (props.districtId) {
                formData.append('district_id', props.districtId);
            }
            if (file) formData.append('image', file);

            const res = await fetch(`${API_BASE}/issues`, {
                method: 'POST',
                body: formData
            });

            if (res.ok) {
                const data = await res.json();
                onSuccess(data);
            } else {
                alert("Sorun bildirilemedi.");
            }
        } catch (err) {
            console.error(err);
            alert("Hata oluştu.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.8)', zIndex: 10000,
            display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
            <div style={{ background: '#1e293b', padding: 24, borderRadius: 16, width: 400, border: '1px solid #334155' }}>
                <h3 style={{ color: 'white', marginBottom: 12 }}>Sorun Bildir</h3>
                <p style={{ color: '#94a3b8', fontSize: 13, marginBottom: 16 }}>
                    Konum: {latlng.lat.toFixed(5)}, {latlng.lng.toFixed(5)}
                </p>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <div>
                        <label style={{ color: '#cbd5e1', fontSize: 13 }}>Sorun Tipi</label>
                        <select
                            value={type}
                            onChange={e => setType(e.target.value)}
                            style={{ width: '100%', padding: 8, marginTop: 4, borderRadius: 6, background: '#0f172a', color: 'white', border: '1px solid #334155' }}
                        >
                            <option value="pothole">Çukur / Yol Bozukluğu</option>
                            <option value="lighting">Aydınlatma Sorunu</option>
                            <option value="garbage">Çöp / Temizlik</option>
                            <option value="traffic">Trafik Sıkışıklığı</option>
                            <option value="park">Park / Yeşil Alan Sorunu</option>
                            <option value="other">Diğer</option>
                        </select>
                    </div>
                    <div>
                        <label style={{ color: '#cbd5e1', fontSize: 13 }}>Açıklama</label>
                        <textarea
                            value={desc}
                            onChange={e => setDesc(e.target.value)}
                            rows={3}
                            style={{ width: '100%', padding: 8, marginTop: 4, borderRadius: 6, background: '#0f172a', color: 'white', border: '1px solid #334155' }}
                        />
                    </div>
                    <div>
                        <label style={{ color: '#cbd5e1', fontSize: 13 }}>Fotoğraf (İsteğe bağlı)</label>
                        <input type="file" onChange={e => setFile(e.target.files[0])} style={{ marginTop: 4, fontSize: 13, color: 'white' }} />
                    </div>

                    <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
                        <button type="button" onClick={onClose} style={{ flex: 1, padding: 10, borderRadius: 8, background: 'transparent', border: '1px solid #475569', color: 'white', cursor: 'pointer' }}>İptal</button>
                        <button type="submit" disabled={loading} style={{ flex: 2, padding: 10, borderRadius: 8, background: '#f59e0b', border: 'none', color: 'white', fontWeight: 600, cursor: 'pointer' }}>
                            {loading ? "Gönderiliyor..." : "Gönder"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
