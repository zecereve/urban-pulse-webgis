import { useEffect, useState } from "react";

function App() {
  const [ping, setPing] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("http://localhost:5050/ping");
        const data = await res.json();
        setPing(data);
      } catch (e) {
        setError(String(e));
      }
    }
    load();
  }, []);

  return (
    <div style={{ padding: "2rem", fontFamily: "Arial" }}>
      <h1>Urban Pulse WebGIS</h1>

      {error && <p style={{ color: "red" }}>Hata: {error}</p>}

      {!error && !ping && <p>Backend’e bağlanıyor…</p>}

      {ping && (
        <>
          <p>Frontend ✅</p>
          <p>Backend ✅</p>
          <p>
            Ping time: <b>{ping.time}</b>
          </p>
        </>
      )}
    </div>
  );
}

export default App;
