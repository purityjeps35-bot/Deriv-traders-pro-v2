
"use client";

import { useEffect, useState } from "react";

const MARKETS = [
  { name: "Volatility 10", symbol: "R_10" },
  { name: "Volatility 25", symbol: "R_25" },
  { name: "Volatility 50", symbol: "R_50" },
  { name: "Volatility 70", symbol: "R_70" },
  { name: "Volatility 100", symbol: "R_100" },
  { name: "Volatility 100 (1s)", symbol: "1HZ100V" }
];

export default function Home() {
  const [market, setMarket] = useState("R_100");
  const [ticks, setTicks] = useState([]);
  const [status, setStatus] = useState("Connecting...");
  const [price, setPrice] = useState(null);
  const [pipSize, setPipSize] = useState(2);
  const [barrier, setBarrier] = useState(4);
  const [digit, setDigit] = useState(7);

  useEffect(() => {
    let socket;
    let stopped = false;
    let retry;

    setTicks([]);
    setPrice(null);
    setStatus("Connecting...");

    function connect() {
      if (stopped) return;

      socket = new WebSocket(
        "wss://ws.derivws.com/websockets/v3?app_id=1089"
      );

      socket.onopen = () => {
        if (stopped) return;
        setStatus("Connected — waiting for ticks");
        socket.send(JSON.stringify({
          ticks: market,
          subscribe: 1
        }));
      };

      socket.onmessage = (event) => {
        if (stopped) return;

        const data = JSON.parse(event.data);

        if (data.error) {
          setStatus("API error: " + data.error.message);
          return;
        }

        if (data.tick) {
          const tick = data.tick;
          const size = Number(tick.pip_size ?? 2);
          const quote = Number(tick.quote);
          const formatted = quote.toFixed(size);
          const lastDigit = Number(formatted.slice(-1));

          setPrice(formatted);
          setPipSize(size);
          setTicks(previous => [
            ...previous,
            { price: quote, digit: lastDigit }
          ].slice(-100));
          setStatus("Live");
        }
      };

      socket.onerror = () => {
        setStatus("Connection error");
      };

      socket.onclose = (event) => {
  if (stopped) return;

  const message =
    `Socket closed: ${event.code} — ${
      event.reason || "No reason provided"
    }`;

  console.log(message);
  setStatus(message);

  retry = setTimeout(connect, 5000);
};
       
        
        
      
    }

    connect();

    return () => {
      stopped = true;
      clearTimeout(retry);
      if (socket) socket.close();
    };
  }, [market]);

  const count = ticks.length;
  const even = ticks.filter(t => t.digit % 2 === 0).length;
  const odd = count - even;
  const over = ticks.filter(t => t.digit > Number(barrier)).length;
  const under = ticks.filter(t => t.digit < Number(barrier)).length;
  const matches = ticks.filter(t => t.digit === Number(digit)).length;
  const differs = count - matches;
  const rises = ticks.slice(1).filter(
    (t, i) => t.price > ticks[i].price
  ).length;
  const falls = ticks.slice(1).filter(
    (t, i) => t.price < ticks[i].price
  ).length;

  function percent(n) {
    return count ? (100 * n / count).toFixed(1) + "%" : "—";
  }

  const panel = {
    background: "#172033",
    padding: 16,
    borderRadius: 12,
    border: "1px solid #334155"
  };

  return (
    <main style={{
      minHeight: "100vh",
      background: "#0b1120",
      color: "#f8fafc",
      padding: 20,
      fontFamily: "Arial, sans-serif"
    }}>
      <h1>DerivTraders Pro</h1>
      <p style={{ color: "#94a3b8" }}>
        Live market data & digit analysis
      </p>

      <section style={panel}>
        <label>Volatility market</label>
        <select
          value={market}
          onChange={e => setMarket(e.target.value)}
          style={{
            display: "block",
            width: "100%",
            padding: 12,
            marginTop: 8,
            background: "#0b1120",
            color: "white"
          }}
        >
          {MARKETS.map(m => (
            <option key={m.symbol} value={m.symbol}>
              {m.name}
            </option>
          ))}
        </select>

        <p>Connection: <strong>{status}</strong></p>
        <p>Latest price</p>
        <h2 style={{ color: "#38bdf8", fontSize: 32 }}>
          {price ?? "Waiting for ticks..."}
        </h2>
        <p>Ticks collected: {count} / 100</p>
      </section>

      <h2>Last-digit analysis</h2>
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
        gap: 12
      }}>
        <div style={panel}>
          <h3>Even</h3>
          <h2>{even}</h2>
          <p>{percent(even)}</p>
        </div>
        <div style={panel}>
          <h3>Odd</h3>
          <h2>{odd}</h2>
          <p>{percent(odd)}</p>
        </div>
        <div style={panel}>
          <h3>Over {barrier}</h3>
          <h2>{over}</h2>
          <p>{percent(over)}</p>
        </div>
        <div style={panel}>
          <h3>Under {barrier}</h3>
          <h2>{under}</h2>
          <p>{percent(under)}</p>
        </div>
        <div style={panel}>
          <h3>Matches {digit}</h3>
          <h2>{matches}</h2>
          <p>{percent(matches)}</p>
        </div>
        <div style={panel}>
          <h3>Differs {digit}</h3>
          <h2>{differs}</h2>
          <p>{percent(differs)}</p>
        </div>
        <div style={panel}>
          <h3>Rise ticks</h3>
          <h2>{rises}</h2>
        </div>
        <div style={panel}>
          <h3>Fall ticks</h3>
          <h2>{falls}</h2>
        </div>
      </div>

      <section style={{ ...panel, marginTop: 16 }}>
        <label>Over/Under barrier: {barrier}</label>
        <input
          type="range"
          min="0"
          max="9"
          value={barrier}
          onChange={e => setBarrier(Number(e.target.value))}
        />
        <p>Match digit: {digit}</p>
        <input
          type="range"
          min="0"
          max="9"
          value={digit}
          onChange={e => setDigit(Number(e.target.value))}
        />
      </section>

      <section style={{ ...panel, marginTop: 16 }}>
        <h3>Recent last digits</h3>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {ticks.slice(-20).reverse().map((t, i) => (
            <span key={i} style={{
              background: "#263449",
              padding: 10,
              borderRadius: 8
            }}>
              {t.digit}
            </span>
          ))}
        </div>
        <p style={{ color: "#94a3b8", fontSize: 12 }}>
          Statistics describe collected ticks and do not predict
          future outcomes or guarantee profits.
        </p>
      </section>
    </main>
  );
}
